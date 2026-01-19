package com.avelar.vipdeliverer;

import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.Sound;
import org.bukkit.command.ConsoleCommandSender;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import java.net.URLEncoder;

public class DeliveryPollTask {

    private final JavaPlugin plugin;
    private int taskId = -1;

    public DeliveryPollTask(JavaPlugin plugin) {
        this.plugin = plugin;
    }

    public void start() {
        final int pollSeconds = plugin.getConfig().getInt("api.pollSeconds", 5);

        taskId = Bukkit.getScheduler().scheduleSyncRepeatingTask(plugin, new Runnable() {
            @Override
            public void run() {
                Bukkit.getScheduler().runTaskAsynchronously(plugin, new Runnable() {
                    @Override
                    public void run() {
                        pollOnce();
                    }
                });
            }
        }, 20L, pollSeconds * 20L);
    }

    public void stop() {
        if (taskId != -1) Bukkit.getScheduler().cancelTask(taskId);
    }

    private void pollOnce() {
        try {
            final String baseUrl = HttpJson.trimSlash(plugin.getConfig().getString("api.baseUrl", "http://localhost:3000"));
            final String token = plugin.getConfig().getString("api.token", "");
            final String serverId = plugin.getConfig().getString("api.serverId", "default");
            final String instanceId = plugin.getConfig().getString("api.instanceId", "instance-1");
            final int leaseSeconds = plugin.getConfig().getInt("api.leaseSeconds", 60);

            if (token == null || token.trim().isEmpty()) {
                plugin.getLogger().warning("[VipDeliverer] Missing api.token in config.yml");
                return;
            }

            final String url =
                    baseUrl
                            + "/api/deliveries/pending?serverId="
                            + URLEncoder.encode(serverId, "UTF-8")
                            + "&leaseSeconds="
                            + leaseSeconds;

            final JSONObject res = HttpJson.httpGetJson(url, token, instanceId);

            final long count = HttpJson.asLong(res.get("count"));
            if (count <= 0) return;

            final JSONArray deliveries = (JSONArray) res.get("deliveries");
            if (deliveries == null || deliveries.isEmpty()) return;

            final JSONObject d = (JSONObject) deliveries.get(0);

            final String deliveryId = String.valueOf(d.get("deliveryId"));
            if (deliveryId == null || deliveryId.trim().isEmpty()) return;

            final String playerNick = HttpJson.safeStr(d.get("playerNick"));
            final String productName = HttpJson.safeStr(d.get("productName"));
            final String productSlug = HttpJson.safeStr(d.get("productSlug"));

            JSONArray commands = (JSONArray) d.get("commands");
            if (commands == null) {
                commands = new JSONArray();
                Object single = d.get("command");
                if (single != null) commands.add(String.valueOf(single));
            }

            final JSONArray finalCommands = commands;
            final String finalDeliveryId = deliveryId;
            final String finalBaseUrl = baseUrl;
            final String finalToken = token;
            final String finalInstanceId = instanceId;

            Bukkit.getScheduler().runTask(plugin, new Runnable() {
                @Override
                public void run() {
                    try {
                        // Se o VIP exige player online, check aqui
                        if (playerNick != null && playerNick.trim().length() > 0) {
                            Player p = Bukkit.getPlayerExact(playerNick);
                            if (p == null || !p.isOnline()) {
                                asyncFail(finalDeliveryId, finalBaseUrl, finalToken, finalInstanceId, "PLAYER_OFFLINE");
                                plugin.getLogger().info("[VipDeliverer] Player offline, scheduled retry: " + finalDeliveryId + " nick=" + playerNick);
                                return;
                            }
                        }

                        ConsoleCommandSender console = Bukkit.getConsoleSender();

                        for (int i = 0; i < finalCommands.size(); i++) {
                            String cmd = String.valueOf(finalCommands.get(i));
                            if (cmd == null || cmd.trim().isEmpty()) continue;

                            boolean ok = Bukkit.dispatchCommand(console, cmd);
                            if (!ok) throw new RuntimeException("COMMAND_FAILED: " + cmd);
                        }

                        // Broadcast
                        broadcastVip(playerNick, productName, productSlug);

                        // Som
                        playSoundAll();

                        asyncConfirm(finalDeliveryId, finalBaseUrl, finalToken, finalInstanceId);
                        plugin.getLogger().info("[VipDeliverer] Delivered " + finalDeliveryId);

                    } catch (Exception e) {
                        asyncFail(finalDeliveryId, finalBaseUrl, finalToken, finalInstanceId, e.getMessage());
                        plugin.getLogger().warning("[VipDeliverer] Failed " + finalDeliveryId + ": " + e.getMessage());
                    }
                }
            });

        } catch (Exception e) {
            plugin.getLogger().warning("[VipDeliverer] Poll error: " + e.getMessage());
        }
    }

    private void broadcastVip(String playerNick, String productName, String productSlug) {
        boolean enabled = plugin.getConfig().getBoolean("broadcast.enabled", true);
        if (!enabled) return;

        String prefix = CC.color(plugin.getConfig().getString("broadcast.prefix", "&9[VIP]&r "));
        String vipDisplay = (productName != null && productName.length() > 0) ? productName : productSlug;

        String line1 = plugin.getConfig().getString("broadcast.line1", "{player} adquiriu o &6{product}");
        String line2 = plugin.getConfig().getString("broadcast.line2", "Digite &e/site&r para adquirir o seu e ter &6vantagens exclusivas.");

        line1 = line1.replace("{player}", playerNick).replace("{product}", vipDisplay);
        line2 = line2.replace("{player}", playerNick).replace("{product}", vipDisplay);

        Bukkit.broadcastMessage(prefix + CC.color(line1));
        Bukkit.broadcastMessage(prefix + CC.color(line2));
    }

    private void playSoundAll() {
        boolean enabled = plugin.getConfig().getBoolean("sound.enabled", true);
        if (!enabled) return;

        String name = plugin.getConfig().getString("sound.name", "AMBIENCE_THUNDER");
        float vol = (float) plugin.getConfig().getDouble("sound.volume", 1.0);
        float pitch = (float) plugin.getConfig().getDouble("sound.pitch", 1.0);

        Sound s;
        try {
            s = Sound.valueOf(name);
        } catch (Exception e) {
            s = Sound.AMBIENCE_THUNDER;
        }

        for (Player online : Bukkit.getOnlinePlayers()) {
            online.playSound(online.getLocation(), s, vol, pitch);
        }
    }

    // ========= async HTTP =========

    private void asyncConfirm(final String deliveryId, final String baseUrl, final String token, final String instanceId) {
        Bukkit.getScheduler().runTaskAsynchronously(plugin, new Runnable() {
            @Override
            public void run() {
                confirm(deliveryId, baseUrl, token, instanceId);
            }
        });
    }

    private void asyncFail(final String deliveryId, final String baseUrl, final String token, final String instanceId, final String err) {
        Bukkit.getScheduler().runTaskAsynchronously(plugin, new Runnable() {
            @Override
            public void run() {
                fail(deliveryId, baseUrl, token, instanceId, err);
            }
        });
    }

    private void confirm(String deliveryId, String baseUrl, String token, String instanceId) {
        try {
            String url = baseUrl + "/api/deliveries/confirm";
            JSONObject body = new JSONObject();
            body.put("deliveryId", deliveryId);
            HttpJson.httpPostJson(url, token, instanceId, body);
        } catch (Exception e) {
            plugin.getLogger().warning("[VipDeliverer] confirm error: " + e.getMessage());
        }
    }

    private void fail(String deliveryId, String baseUrl, String token, String instanceId, String err) {
        try {
            String url = baseUrl + "/api/deliveries/fail";
            JSONObject body = new JSONObject();
            body.put("deliveryId", deliveryId);
            body.put("error", err == null ? "UNKNOWN_ERROR" : err);
            HttpJson.httpPostJson(url, token, instanceId, body);
        } catch (Exception e) {
            plugin.getLogger().warning("[VipDeliverer] fail error: " + e.getMessage());
        }
    }
}
