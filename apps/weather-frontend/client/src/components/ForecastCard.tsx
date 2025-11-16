import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DayForecast } from '@/types/weather';

interface ForecastCardProps {
  forecast: DayForecast;
  dayNumber: number;
}

export default function ForecastCard({ forecast, dayNumber }: ForecastCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">
          Day {dayNumber} ({forecast.date})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <span className="text-xl">☁️</span>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Weather</p>
            <p className="text-sm">{forecast.weather}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <span className="text-xl">🌡️</span>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Temperature</p>
            <p className="text-sm">{forecast.temperature.low}°C - {forecast.temperature.high}°C</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <span className="text-xl">💧</span>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Humidity</p>
            <p className="text-sm">{forecast.humidity.low}% - {forecast.humidity.high}%</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <span className="text-xl">💨</span>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Wind</p>
            <p className="text-sm">
              {forecast.wind.speedLow} - {forecast.wind.speedHigh} km/h {forecast.wind.direction}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
