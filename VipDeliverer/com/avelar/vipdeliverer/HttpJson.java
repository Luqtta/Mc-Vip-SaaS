package com.avelar.vipdeliverer;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

public class HttpJson {

    public static JSONObject httpGetJson(String urlStr, String bearerToken, String instanceId) throws Exception {
        HttpURLConnection con = (HttpURLConnection) new URL(urlStr).openConnection();
        con.setRequestMethod("GET");
        con.setRequestProperty("Authorization", "Bearer " + bearerToken);
        con.setRequestProperty("X-Instance-Id", instanceId);
        con.setRequestProperty("Accept", "application/json");

        int code = con.getResponseCode();
        String text = readAll(code >= 200 && code < 300 ? con.getInputStream() : con.getErrorStream());
        if (code < 200 || code >= 300) throw new RuntimeException("HTTP " + code + " " + text);

        return (JSONObject) new JSONParser().parse(text);
    }

    public static JSONObject httpPostJson(String urlStr, String bearerToken, String instanceId, JSONObject body) throws Exception {
        HttpURLConnection con = (HttpURLConnection) new URL(urlStr).openConnection();
        con.setRequestMethod("POST");
        con.setDoOutput(true);
        con.setRequestProperty("Authorization", "Bearer " + bearerToken);
        con.setRequestProperty("X-Instance-Id", instanceId);
        con.setRequestProperty("Content-Type", "application/json; charset=utf-8");
        con.setRequestProperty("Accept", "application/json");

        OutputStream os = con.getOutputStream();
        os.write(body.toJSONString().getBytes("UTF-8"));
        os.flush();
        os.close();

        int code = con.getResponseCode();
        String text = readAll(code >= 200 && code < 300 ? con.getInputStream() : con.getErrorStream());
        if (code < 200 || code >= 300) throw new RuntimeException("HTTP " + code + " " + text);

        if (text == null || text.trim().isEmpty()) return new JSONObject();
        return (JSONObject) new JSONParser().parse(text);
    }

    private static String readAll(InputStream is) throws IOException {
        if (is == null) return "";
        BufferedReader br = new BufferedReader(new InputStreamReader(is, "UTF-8"));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) sb.append(line);
        br.close();
        return sb.toString();
    }

    public static long asLong(Object o) {
        if (o == null) return 0L;
        if (o instanceof Number) return ((Number) o).longValue();
        try { return Long.parseLong(String.valueOf(o)); } catch (Exception e) { return 0L; }
    }

    public static String safeStr(Object o) {
        if (o == null) return "";
        return String.valueOf(o);
    }

    public static String trimSlash(String url) {
        if (url == null) return "";
        url = url.trim();
        while (url.endsWith("/")) url = url.substring(0, url.length() - 1);
        return url;
    }
}
