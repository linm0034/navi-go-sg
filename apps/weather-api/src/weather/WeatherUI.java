package weather;

public class WeatherUI {
    private WeatherController weatherController;

    public WeatherUI(WeatherController weatherController) {
        this.weatherController = weatherController;
    }

    /**
     * 显示完整的天气预报（包含风速和湿度）
     */
    public void displayWeatherForecast() {
        WeatherInfo weatherInfo = weatherController.getWeatherForecast();
        
        if (weatherInfo != null) {
            System.out.println("🌤️ === Singapore 4-Day Weather Forecast ===");
            System.out.println("📅 Last Updated: " + formatTimestamp(weatherInfo.getTimestamp()));
            System.out.println();
            
            int dayNumber = 1;
            for (WeatherInfo.DayForecast forecast : weatherInfo.getForecasts()) {
                System.out.println("📍 Day " + dayNumber + " (" + forecast.getDate() + "):");
                System.out.println("   ☁️  Weather: " + forecast.getWeather());
                System.out.println("   🌡️  Temperature: " + forecast.getTemperature().getFormatted());
                System.out.println("   💧 Humidity: " + forecast.getHumidity().getFormatted());
                System.out.println("   💨 Wind: " + forecast.getWind().getFormatted());
                System.out.println();
                dayNumber++;
            }
            
            // 显示旅游建议（基于天气）
            displayTravelAdvice(weatherInfo);
        } else {
            System.out.println("❌ Unable to fetch weather data. Please try again later.");
        }
    }
    
    /**
     * 显示简洁版的今日天气（适合主界面显示）
     */
    public void displayTodayWeather() {
        WeatherInfo weatherInfo = weatherController.getWeatherForecast();
        
        if (weatherInfo != null && !weatherInfo.getForecasts().isEmpty()) {
            WeatherInfo.DayForecast today = weatherInfo.getForecasts().get(0);
            
            System.out.println("🔄 === Today's Weather ===");
            System.out.println("📅 " + today.getDate());
            System.out.println("☁️  " + today.getWeather());
            System.out.println("🌡️  " + today.getTemperature().getFormatted());
            System.out.println("💧 " + today.getHumidity().getFormatted());
            System.out.println("💨 " + today.getWind().getFormatted());
        } else {
            System.out.println("❌ Unable to fetch today's weather.");
        }
    }
    
    /**
     * 专门显示风速信息（适合户外活动建议）
     */
    public void displayWindInfo() {
        WeatherInfo weatherInfo = weatherController.getWeatherForecast();
        
        if (weatherInfo != null && !weatherInfo.getForecasts().isEmpty()) {
            System.out.println("💨 === Wind Conditions ===");
            
            for (WeatherInfo.DayForecast forecast : weatherInfo.getForecasts()) {
                WeatherInfo.Wind wind = forecast.getWind();
                String windAdvice = getWindAdvice(wind.getSpeedHigh());
                
                System.out.println(forecast.getDate() + ":");
                System.out.println("   Speed: " + wind.getSpeedFormatted());
                System.out.println("   Direction: " + wind.getDirection());
                System.out.println("   Advice: " + windAdvice);
                System.out.println();
            }
        }
    }
    
    /**
     * 专门显示湿度信息（适合健康建议）
     */
    public void displayHumidityInfo() {
        WeatherInfo weatherInfo = weatherController.getWeatherForecast();
        
        if (weatherInfo != null && !weatherInfo.getForecasts().isEmpty()) {
            System.out.println("💧 === Humidity Levels ===");
            
            for (WeatherInfo.DayForecast forecast : weatherInfo.getForecasts()) {
                WeatherInfo.Humidity humidity = forecast.getHumidity();
                String humidityAdvice = getHumidityAdvice(humidity.getHigh());
                
                System.out.println(forecast.getDate() + ":");
                System.out.println("   Level: " + humidity.getFormatted());
                System.out.println("   Advice: " + humidityAdvice);
                System.out.println();
            }
        }
    }
    
    /**
     * 基于天气的旅游建议
     */
    private void displayTravelAdvice(WeatherInfo weatherInfo) {
        System.out.println("🎒 === Travel Advice ===");
        
        for (WeatherInfo.DayForecast forecast : weatherInfo.getForecasts()) {
            System.out.println(forecast.getDate() + ":");
            
            // 基于天气给出建议
            String weatherAdvice = getWeatherAdvice(forecast.getWeather());
            String windAdvice = getWindAdvice(forecast.getWind().getSpeedHigh());
            String humidityAdvice = getHumidityAdvice(forecast.getHumidity().getHigh());
            
            System.out.println("   🌤️  " + weatherAdvice);
            System.out.println("   💨 " + windAdvice);
            System.out.println("   💧 " + humidityAdvice);
            System.out.println();
        }
    }
    
    // 辅助方法：获取风速建议
    private String getWindAdvice(int windSpeed) {
        if (windSpeed < 10) return "Calm conditions, perfect for outdoor activities";
        else if (windSpeed < 20) return "Light breeze, good for flying kites";
        else if (windSpeed < 30) return "Moderate wind, be careful with umbrellas";
        else return "Windy conditions, consider indoor activities";
    }
    
    // 辅助方法：获取湿度建议
    private String getHumidityAdvice(int humidity) {
        if (humidity < 40) return "Low humidity, remember to drink water";
        else if (humidity < 70) return "Comfortable humidity level";
        else if (humidity < 85) return "High humidity, may feel sticky";
        else return "Very high humidity, avoid strenuous outdoor activities";
    }
    
    // 辅助方法：获取天气建议
    private String getWeatherAdvice(String weather) {
        if (weather.toLowerCase().contains("shower") || weather.toLowerCase().contains("rain")) {
            return "☔ Rain expected, carry umbrella and wear waterproof shoes";
        } else if (weather.toLowerCase().contains("fair") || weather.toLowerCase().contains("sunny")) {
            return "☀️ Good weather for outdoor sightseeing, don't forget sunscreen";
        } else if (weather.toLowerCase().contains("cloud")) {
            return "⛅ Cloudy but pleasant, good for walking tours";
        } else if (weather.toLowerCase().contains("wind")) {
            return "💨 Windy conditions, secure loose items";
        } else {
            return "Enjoy your day!";
        }
    }
    
    // 格式化时间戳
    private String formatTimestamp(String timestamp) {
        return timestamp.replace("+08:00", "").replace("T", " ");
    }
    
    /**
     * 获取今日天气摘要（用于App主界面）
     */
    public String getTodayWeatherSummary() {
        WeatherInfo weatherInfo = weatherController.getWeatherForecast();
        if (weatherInfo != null && !weatherInfo.getForecasts().isEmpty()) {
            WeatherInfo.DayForecast today = weatherInfo.getForecasts().get(0);
            return today.getWeather() + " | " + today.getTemperature().getFormatted() + 
                   " | Wind: " + today.getWind().getSpeedFormatted();
        }
        return "Weather data unavailable";
    }
}