package weather;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import org.json.JSONArray;
import org.json.JSONObject;

public class WeatherService {
    private static final String API_URL = "https://api-open.data.gov.sg/v2/real-time/api/four-day-outlook";

    public WeatherInfo fetchWeatherData() {
        WeatherInfo weatherInfo = null;
        
        try {
            // 1. 建立连接
            URL url = new URL(API_URL);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("Accept", "application/json");

            // 2. 检查响应状态
            int responseCode = connection.getResponseCode();
            if (responseCode != 200) {
                System.out.println("API Request Failed. Response Code: " + responseCode);
                return null;
            }

            // 3. 读取响应
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(connection.getInputStream()));
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
            reader.close();

            // 4. 解析JSON数据
            weatherInfo = parseWeatherData(response.toString());
            
        } catch (Exception e) {
            System.err.println("Error fetching weather data: " + e.getMessage());
            e.printStackTrace();
        }
        
        return weatherInfo;
    }

    private WeatherInfo parseWeatherData(String jsonResponse) {
        try {
            JSONObject json = new JSONObject(jsonResponse);
            
            // 根据你提供的实际JSON结构进行解析
            JSONObject data = json.getJSONObject("data");
            JSONArray records = data.getJSONArray("records");
            
            if (records.length() == 0) {
                return null;
            }
            
            // 获取第一条记录（应该只有一条）
            JSONObject record = records.getJSONObject(0);
            String timestamp = record.getString("timestamp");
            String date = record.getString("date");
            
            // 创建WeatherInfo对象
            WeatherInfo weatherInfo = new WeatherInfo("Singapore", timestamp);
            
            // 解析天气预报数据
            JSONArray forecasts = record.getJSONArray("forecasts");
         // 在解析循环中添加湿度和风速的解析
            for (int i = 0; i < forecasts.length(); i++) {
                JSONObject forecast = forecasts.getJSONObject(i);
                
                String day = forecast.getString("day");
                String weatherText = forecast.getJSONObject("forecast").getString("text");
                String weatherSummary = forecast.getJSONObject("forecast").getString("summary");
                
                // 解析温度
                JSONObject temp = forecast.getJSONObject("temperature");
                int low = temp.getInt("low");
                int high = temp.getInt("high");
                WeatherInfo.Temperature temperature = new WeatherInfo.Temperature(low, high);
                
                // 解析湿度（新增）
                JSONObject humidity = forecast.getJSONObject("relativeHumidity");
                int humidityLow = humidity.getInt("low");
                int humidityHigh = humidity.getInt("high");
                WeatherInfo.Humidity humidityObj = new WeatherInfo.Humidity(humidityLow, humidityHigh);
                
                // 解析风速和风向（新增）
                JSONObject wind = forecast.getJSONObject("wind");
                JSONObject windSpeed = wind.getJSONObject("speed");
                int windSpeedLow = windSpeed.getInt("low");
                int windSpeedHigh = windSpeed.getInt("high");
                String windDirection = wind.getString("direction");
                WeatherInfo.Wind windObj = new WeatherInfo.Wind(windSpeedLow, windSpeedHigh, windDirection);
                
                // 创建单日预报（更新构造函数）
                WeatherInfo.DayForecast dayForecast = 
                    new WeatherInfo.DayForecast(day, weatherText + " - " + weatherSummary, 
                                               temperature, humidityObj, windObj);
                weatherInfo.addForecast(dayForecast);
            }
                
                
            
            
            return weatherInfo;
            
        } catch (Exception e) {
            System.err.println("Error parsing weather data: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}