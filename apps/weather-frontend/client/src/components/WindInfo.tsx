import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DayForecast } from '@/types/weather';
import { getWindAdvice } from '@/services/weatherService';

interface WindInfoProps {
  forecasts: DayForecast[];
}

export default function WindInfo({ forecasts }: WindInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>💨</span>
          Wind Conditions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {forecasts.map((forecast, index) => (
          <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
            <p className="font-medium mb-2">{forecast.date}</p>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Speed:</span>{' '}
                {forecast.wind.speedLow} - {forecast.wind.speedHigh} km/h
              </p>
              <p>
                <span className="text-muted-foreground">Direction:</span>{' '}
                {forecast.wind.direction}
              </p>
              <p className="text-primary">
                <span className="text-muted-foreground">Advice:</span>{' '}
                {getWindAdvice(forecast.wind.speedHigh)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
