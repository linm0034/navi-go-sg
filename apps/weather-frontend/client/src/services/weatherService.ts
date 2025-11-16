import type { WeatherAPIResponse, WeatherInfo } from '@/types/weather';

const API_URL = 'https://api-open.data.gov.sg/v2/real-time/api/four-day-outlook';

export async function fetchWeatherData(): Promise<WeatherInfo | null> {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('API Request Failed. Response Code:', response.status);
      return null;
    }

    const data: WeatherAPIResponse = await response.json();
    return parseWeatherData(data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

function parseWeatherData(apiResponse: WeatherAPIResponse): WeatherInfo | null {
  try {
    const records = apiResponse.data.records;
    
    if (records.length === 0) {
      return null;
    }

    const record = records[0];
    const weatherInfo: WeatherInfo = {
      location: 'Singapore',
      timestamp: record.timestamp,
      forecasts: record.forecasts.map(forecast => ({
        date: forecast.day,
        weather: `${forecast.forecast.text} - ${forecast.forecast.summary}`,
        temperature: {
          low: forecast.temperature.low,
          high: forecast.temperature.high,
        },
        humidity: {
          low: forecast.relativeHumidity.low,
          high: forecast.relativeHumidity.high,
        },
        wind: {
          speedLow: forecast.wind.speed.low,
          speedHigh: forecast.wind.speed.high,
          direction: forecast.wind.direction,
        },
      })),
    };

    return weatherInfo;
  } catch (error) {
    console.error('Error parsing weather data:', error);
    return null;
  }
}

// 辅助函数
export function getWeatherAdvice(weather: string): string {
  const lowerWeather = weather.toLowerCase();
  if (lowerWeather.includes('shower') || lowerWeather.includes('rain')) {
    return '☔ Rain expected, carry umbrella and wear waterproof shoes';
  } else if (lowerWeather.includes('fair') || lowerWeather.includes('sunny')) {
    return '☀️ Good weather for outdoor sightseeing, don\'t forget sunscreen';
  } else if (lowerWeather.includes('cloud')) {
    return '⛅ Cloudy but pleasant, good for walking tours';
  } else if (lowerWeather.includes('wind')) {
    return '💨 Windy conditions, secure loose items';
  }
  return 'Enjoy your day!';
}

export function getWindAdvice(windSpeed: number): string {
  if (windSpeed < 10) return 'Calm conditions, perfect for outdoor activities';
  if (windSpeed < 20) return 'Light breeze, good for flying kites';
  if (windSpeed < 30) return 'Moderate wind, be careful with umbrellas';
  return 'Windy conditions, consider indoor activities';
}

export function getHumidityAdvice(humidity: number): string {
  if (humidity < 40) return 'Low humidity, remember to drink water';
  if (humidity < 70) return 'Comfortable humidity level';
  if (humidity < 85) return 'High humidity, may feel sticky';
  return 'Very high humidity, avoid strenuous outdoor activities';
}

export function formatTimestamp(timestamp: string): string {
  return timestamp.replace('+08:00', '').replace('T', ' ');
}
