import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { APP_TITLE } from '@/const';
import type { WeatherInfo } from '@/types/weather';
import { fetchWeatherData, formatTimestamp } from '@/services/weatherService';
import ForecastCard from '@/components/ForecastCard';
import TodayWeather from '@/components/TodayWeather';
import WindInfo from '@/components/WindInfo';
import HumidityInfo from '@/components/HumidityInfo';
import TravelAdvice from '@/components/TravelAdvice';

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeatherData = async () => {
    setLoading(true);
    setError(null);
    const data = await fetchWeatherData();
    if (data) {
      setWeatherData(data);
    } else {
      setError('Unable to fetch weather data. Please try again later.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadWeatherData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">❌ {error}</p>
          <Button onClick={loadWeatherData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-7xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🌤️ {APP_TITLE}</h1>
          <p className="text-muted-foreground">
            📅 Last Updated: {formatTimestamp(weatherData.timestamp)}
          </p>
          <Button onClick={loadWeatherData} variant="outline" className="mt-4">
            Refresh Data
          </Button>
        </header>

        {/* Today's Weather */}
        {weatherData.forecasts.length > 0 && (
          <div className="mb-8">
            <TodayWeather forecast={weatherData.forecasts[0]} />
          </div>
        )}

        {/* 4-Day Forecast */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">4-Day Weather Forecast</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {weatherData.forecasts.map((forecast, index) => (
              <ForecastCard
                key={index}
                forecast={forecast}
                dayNumber={index + 1}
              />
            ))}
          </div>
        </section>

        {/* Wind & Humidity Info */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WindInfo forecasts={weatherData.forecasts} />
            <HumidityInfo forecasts={weatherData.forecasts} />
          </div>
        </section>

        {/* Travel Advice */}
        <section>
          <TravelAdvice forecasts={weatherData.forecasts} />
        </section>
      </div>
    </div>
  );
}
