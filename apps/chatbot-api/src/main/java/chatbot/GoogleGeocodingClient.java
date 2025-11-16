package chatbot;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

@Service
public class GoogleGeocodingClient {

    private static final HttpClient HTTP = HttpClient.newHttpClient();
    private final String apiKey;

    @Autowired
    public GoogleGeocodingClient(ApiConfig config) {
        this.apiKey = config.getGoogleMapsKey();
    }

    public String geocode(String address) throws Exception {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Google Maps API key not set in application.properties");
        }
        if (address == null || address.isBlank()) return null;

        String addrEnc = URLEncoder.encode(address, StandardCharsets.UTF_8);
        String url = String.format(
    "https://maps.googleapis.com/maps/api/geocode/json?address=%s&components=country:SG&key=%s",
        addrEnc, URLEncoder.encode(apiKey, StandardCharsets.UTF_8)
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
        if (root == null || !root.has("status")) return null;
        if (!"OK".equals(root.get("status").getAsString())) return null;

        JsonArray results = root.getAsJsonArray("results");
        if (results == null || results.size() == 0) return null;
        JsonObject geometry = results.get(0).getAsJsonObject().getAsJsonObject("geometry");
        if (geometry == null) return null;

        JsonObject loc = geometry.getAsJsonObject("location");
        if (loc == null) return null;
        double lat = loc.get("lat").getAsDouble();
        double lng = loc.get("lng").getAsDouble();

        return lat + "," + lng;
    }
}