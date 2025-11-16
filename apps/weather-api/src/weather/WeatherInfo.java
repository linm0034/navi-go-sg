package weather;

import java.util.List;
import java.util.ArrayList;

public class WeatherInfo {
    private String location;
    private String timestamp;
    private List<DayForecast> forecasts;
    
    public WeatherInfo(String location, String timestamp) {
        this.location = location;
        this.timestamp = timestamp;
        this.forecasts = new ArrayList<>();
    }
    
    // Getter and Setter
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    
    public List<DayForecast> getForecasts() { return forecasts; }
    public void addForecast(DayForecast forecast) { this.forecasts.add(forecast); }
    
    // 内部类表示单日预报（更新版）
    public static class DayForecast {
        private String date;
        private String weather;
        private Temperature temperature;
        private Humidity humidity;      // 新增：湿度
        private Wind wind;              // 新增：风速和风向
        
        public DayForecast(String date, String weather, Temperature temperature, Humidity humidity, Wind wind) {
            this.date = date;
            this.weather = weather;
            this.temperature = temperature;
            this.humidity = humidity;
            this.wind = wind;
        }
        
        // Getter methods
        public String getDate() { return date; }
        public String getWeather() { return weather; }
        public Temperature getTemperature() { return temperature; }
        public Humidity getHumidity() { return humidity; }
        public Wind getWind() { return wind; }

		
    }
    
    // 温度类（保持不变）
    public static class Temperature {
        private int low;
        private int high;
        
        public Temperature(int low, int high) {
            this.low = low;
            this.high = high;
        }
        
        public int getLow() { return low; }
        public int getHigh() { return high; }
        public String getFormatted() { return low + "°C - " + high + "°C"; }
    }
    
    // 新增：湿度类
    public static class Humidity {
        private int low;
        private int high;
        
        public Humidity(int low, int high) {
            this.low = low;
            this.high = high;
        }
        
        public int getLow() { return low; }
        public int getHigh() { return high; }
        public String getFormatted() { return low + "% - " + high + "%"; }
    }
    
    // 新增：风速和风向类
    public static class Wind {
        private int speedLow;
        private int speedHigh;
        private String direction;
        
        public Wind(int speedLow, int speedHigh, String direction) {
            this.speedLow = speedLow;
            this.speedHigh = speedHigh;
            this.direction = direction;
        }
        
        public int getSpeedLow() { return speedLow; }
        public int getSpeedHigh() { return speedHigh; }
        public String getDirection() { return direction; }
        public String getSpeedFormatted() { return speedLow + " - " + speedHigh + " km/h"; }
        public String getFormatted() { return speedLow + " - " + speedHigh + " km/h " + direction; }
    }
    
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("WeatherInfo{location='").append(location)
          .append("', timestamp='").append(timestamp)
          .append("', forecasts=[");
        for (DayForecast forecast : forecasts) {
            sb.append("\n  ").append(forecast.getDate()).append(": ")
              .append(forecast.getWeather()).append(" (")
              .append(forecast.getTemperature().getFormatted()).append(")");
        }
        sb.append("\n]}");
        return sb.toString();
    }
}