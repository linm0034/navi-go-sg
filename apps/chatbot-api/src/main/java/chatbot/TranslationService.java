package chatbot;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

@Service
public class TranslationService {

    private final HttpClient http;
    private final Gson gson = new Gson();
    private final String provider;

    @Autowired
    public TranslationService(ApiConfig config) {
        this.http = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(8))
                .build();
        this.provider = config.getTranslateProvider();
    }

    /**
     * Translate text using MyMemory API.
     * For now, provider check ensures only 'mymemory' is supported.
     */
    public String translate(String text, String source, String target) throws Exception {
        if (!"mymemory".equalsIgnoreCase(provider)) {
            throw new UnsupportedOperationException("Only MyMemory provider is supported currently. Set translate.provider=mymemory.");
        }

        if (source == null || source.isBlank() || source.equalsIgnoreCase("auto")) {
            throw new IllegalArgumentException("MyMemory requires an explicit source language code (not 'auto').");
        }

        String q = java.net.URLEncoder.encode(text, java.nio.charset.StandardCharsets.UTF_8);
        String langpair = java.net.URLEncoder.encode(source + "|" + target, java.nio.charset.StandardCharsets.UTF_8);
        String url = "https://api.mymemory.translated.net/get?q=" + q + "&langpair=" + langpair;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(20))
                .GET()
                .build();

        HttpResponse<String> resp = http.send(request, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() != 200) {
            throw new RuntimeException("MyMemory HTTP " + resp.statusCode() + ": " + resp.body());
        }

        JsonObject json = gson.fromJson(resp.body(), JsonObject.class);
        if (json.has("responseData")) {
            JsonObject rd = json.getAsJsonObject("responseData");
            if (rd.has("translatedText")) return rd.get("translatedText").getAsString();
        }

        throw new RuntimeException("Unexpected MyMemory response: " + resp.body());
    }

    public String detectLanguage(String text) {
        throw new UnsupportedOperationException("Language detection not supported by provider.");
    }

    public String listLanguages() {
        throw new UnsupportedOperationException("Listing languages not supported by provider.");
    }

    public boolean isMyMemory() {
        return "mymemory".equalsIgnoreCase(provider);
    }
}
