import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DayForecast } from '@/types/weather';

interface TodayWeatherProps {
  forecast: DayForecast;
}

export default function TodayWeather({ forecast }: TodayWeatherProps) {
  return (
    <Card className="bg-primary text-primary-foreground">
      <CardHeader>
        <CardTitle className="text-2xl">🔄 Today's Weather</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm opacity-90">📅 {forecast.date}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm opacity-90">☁️ Weather</p>
            <p className="font-medium">{forecast.weather}</p>
          </div>
          
          <div>
            <p className="text-sm opacity-90">🌡️ Temperature</p>
            <p className="font-medium">{forecast.temperature.low}°C - {forecast.temperature.high}°C</p>
          </div>
          
          <div>
            <p className="text-sm opacity-90">💧 Humidity</p>
            <p className="font-medium">{forecast.humidity.low}% - {forecast.humidity.high}%</p>
          </div>
          
          <div>
            <p className="text-sm opacity-90">💨 Wind</p>
            <p className="font-medium">{forecast.wind.speedLow} - {forecast.wind.speedHigh} km/h {forecast.wind.direction}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
