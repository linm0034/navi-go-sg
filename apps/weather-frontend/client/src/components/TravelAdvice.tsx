import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DayForecast } from '@/types/weather';
import { getWeatherAdvice, getWindAdvice, getHumidityAdvice } from '@/services/weatherService';

interface TravelAdviceProps {
  forecasts: DayForecast[];
}

export default function TravelAdvice({ forecasts }: TravelAdviceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🎒</span>
          Travel Advice
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {forecasts.map((forecast, index) => (
          <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
            <p className="font-medium mb-2">{forecast.date}</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span>🌤️</span>
                <p>{getWeatherAdvice(forecast.weather)}</p>
              </div>
              <div className="flex items-start gap-2">
                <span>💨</span>
                <p>{getWindAdvice(forecast.wind.speedHigh)}</p>
              </div>
              <div className="flex items-start gap-2">
                <span>💧</span>
                <p>{getHumidityAdvice(forecast.humidity.high)}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
