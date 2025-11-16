package weather;

public class WeatherController {
    private WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    public WeatherInfo getWeatherForecast() {
        return weatherService.fetchWeatherData();
    }
}