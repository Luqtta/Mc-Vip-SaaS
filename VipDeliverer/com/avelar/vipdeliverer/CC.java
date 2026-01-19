package com.avelar.vipdeliverer;

import org.bukkit.ChatColor;

public class CC {
    public static String color(String s) {
        if (s == null) return "";
        return ChatColor.translateAlternateColorCodes('&', s);
    }
}
