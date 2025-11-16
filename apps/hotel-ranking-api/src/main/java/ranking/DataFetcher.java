package ranking;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Scanner;

public class DataFetcher {

    public static String readResource(String filename) {
        try (InputStream is = DataFetcher.class.getClassLoader().getResourceAsStream(filename)) {
            if (is == null) {
                System.err.println("资源未找到: " + filename);
                return null;
            }
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            System.err.println("读取资源失败: " + filename + " -> " + e.getMessage());
            return null;
        }
    }

    public static String fetchLtaBusStops() {
        String apiUrl = "https://datamall2.mytransport.sg/ltaodataservice/BusStops";
        String apiKey = "tlgVxf95TEqVXvpNMatZeA=="; // ←← 这里替换成你自己的 LTA Key

        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(apiUrl).openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("AccountKey", apiKey);
            conn.setRequestProperty("accept", "application/json");
            int code = conn.getResponseCode();
            if (code != 200) {
                System.err.println("LTA HTTP 错误: " + code);
                return null;
            }
            try (Scanner sc = new Scanner(conn.getInputStream(), StandardCharsets.UTF_8)) {
                return sc.useDelimiter("\\A").hasNext() ? sc.next() : "";
            }
        } catch (Exception e) {
            System.err.println("LTA 请求失败: " + e.getMessage());
            return null;
        }
    }
}
