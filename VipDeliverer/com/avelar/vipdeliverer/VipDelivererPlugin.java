package com.avelar.vipdeliverer;

import org.bukkit.plugin.java.JavaPlugin;

public class VipDelivererPlugin extends JavaPlugin {

    private DeliveryPollTask pollTask;

    @Override
    public void onEnable() {
        saveDefaultConfig();

        pollTask = new DeliveryPollTask(this);
        pollTask.start();

        getLogger().info("[VipDeliverer] Enabled.");
        getLogger().info("Desenvolvido por Avelar");
    }

    @Override
    public void onDisable() {
        try {
            if (pollTask != null) pollTask.stop();
        } catch (Exception ignored) {}
        getLogger().info("[VipDeliverer] Disabled.");
    }
}
