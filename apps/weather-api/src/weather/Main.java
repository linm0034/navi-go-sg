package weather;

public class Main {
    public static void main(String[] args) {
        WeatherService service = new WeatherService();
        WeatherController controller = new WeatherController(service);
        WeatherUI weatherUI = new WeatherUI(controller);
        
        // 显示完整预报（包含风速和湿度）
        weatherUI.displayWeatherForecast();
        
        System.out.println("\n" + "=".repeat(50) + "\n");
        
        // 只显示今日天气
        weatherUI.displayTodayWeather();
        
        System.out.println("\n" + "=".repeat(50) + "\n");
        
        // 专门显示风速信息
        weatherUI.displayWindInfo();
        
        System.out.println("\n" + "=".repeat(50) + "\n");
        
        // 专门显示湿度信息
        weatherUI.displayHumidityInfo();
    }
}