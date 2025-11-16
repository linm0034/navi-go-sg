package chatbot;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ApiConfig {

    @Value("${google.maps.api.key}")
    private String googleMapsKey;

    @Value("${translate.provider}")
    private String translateProvider;

    public String getGoogleMapsKey() {
        return googleMapsKey;
    }

    public String getTranslateProvider() {
        return translateProvider;
    }
}
