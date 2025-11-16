package chatbot;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

@Service
public class GoogleDirectionsClient {

    private static final HttpClient HTTP = HttpClient.newHttpClient();
    private final String apiKey;

    @Autowired
    public GoogleDirectionsClient(ApiConfig config) {
        this.apiKey = config.getGoogleMapsKey();
    }

    public List<Integer> getOptimizedWaypointOrder(String origin, String destination, List<String> waypoints) throws Exception {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Google Maps API key not set in application.properties");
        }
        if (waypoints == null || waypoints.isEmpty()) return new ArrayList<>();

        if (waypoints.size() > 23) {
            throw new IllegalArgumentException("Too many waypoints (" + waypoints.size() + "). Max 23 allowed.");
        }

        String originEnc = URLEncoder.encode(origin, StandardCharsets.UTF_8);
        String destEnc = URLEncoder.encode(destination, StandardCharsets.UTF_8);

        StringBuilder wb = new StringBuilder("optimize:true%7C");
        for (int i = 0; i < waypoints.size(); i++) {
            wb.append(URLEncoder.encode(waypoints.get(i), StandardCharsets.UTF_8));
            if (i < waypoints.size() - 1) wb.append("%7C");
        }

        String url = String.format(
            "https://maps.googleapis.com/maps/api/directions/json?origin=%s&destination=%s&waypoints=%s&mode=driving&key=%s",
            originEnc, destEnc, wb, URLEncoder.encode(apiKey, StandardCharsets.UTF_8)
        );

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .header("User-Agent", "TourismChatbot/1.0")
                .build();

        HttpResponse<String> resp = HTTP.send(req, HttpResponse.BodyHandlers.ofString());
        String body = resp.body();

        Gson g = new Gson();
        JsonObject root = g.fromJson(body, JsonObject.class);
        if (root == null || !root.has("status")) {
            throw new RuntimeException("Invalid response from Directions API");
        }

        if (!"OK".equals(root.get("status").getAsString())) {
            String msg = root.has("error_message")
                ? root.get("error_message").getAsString()
                : "Directions API status: " + root.get("status").getAsString();
            throw new RuntimeException(msg);
        }

        JsonArray routes = root.getAsJsonArray("routes");
        if (routes == null || routes.isEmpty()) {
            throw new RuntimeException("No routes returned from Directions API");
        }

        JsonArray waypointOrder = routes.get(0).getAsJsonObject().getAsJsonArray("waypoint_order");
        List<Integer> order = new ArrayList<>();
        if (waypointOrder != null) {
            waypointOrder.forEach(el -> order.add(el.getAsInt()));
        }
        return order;
    }
}
