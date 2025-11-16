import React, { useState, useEffect } from 'react';
import { weatherAPI } from '../services/api';
import Loading from '../components/Loading';

/**
 * Weather page for NaviGo
 *
 * Requirements:
 * - Show today's weather
 * - Show next 3–4 days forecast
 * - Provide travel advice based on weather / wind / humidity
 *
 * This component calls the NaviGo backend gateway at /api/weather,
 * which proxies the official Singapore 4‑day outlook API and returns
 * the raw JSON. We then normalise that JSON on the frontend so the
 * UI is stable even if the exact nesting changes slightly.
 */

const Weather = () => {
  const [weather, setWeather] = useState(null); // { timestamp, forecasts: [...] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await weatherAPI.getCurrentWeather();
      const apiData = response.data;

      const normalised = normaliseWeatherResponse(apiData);

      if (!normalised || !normalised.forecasts || normalised.forecasts.length === 0) {
        throw new Error('No forecast data found');
      }

      setWeather(normalised);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Failed to load weather data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading weather data..." />;
  }

  if (error) {
    return (
      <div className="weather-page">
        <div className="card">
          <h1>🌤️ Weather Forecast</h1>
          <p style={{ color: '#e11d48', marginBottom: '1rem' }}>{error}</p>
          <button onClick={fetchWeather} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="weather-page">
        <div className="card">
          <h1>🌤️ Weather Forecast</h1>
          <p>No weather data available.</p>
        </div>
      </div>
    );
  }

  const forecasts = weather.forecasts;
  const today = forecasts[0];
  const nextDays = forecasts.slice(1, 5); // show up to next 4 days

  return (
    <div className="weather-page">
      {/* Page header */}
      <div className="card">
        <h1>🌤️ Singapore 4‑Day Weather Outlook</h1>
        <p style={{ color: '#666', marginBottom: '0.75rem' }}>
          Live forecast from Singapore&apos;s official open data API
        </p>
        {weather.timestamp && (
          <p style={{ color: '#888', fontSize: '0.9rem' }}>
            Last updated: {formatTimestamp(weather.timestamp)}
          </p>
        )}
      </div>

      {/* Today's weather */}
      {today && (
        <div className="card" style={{ textAlign: 'center' }}>
          <h2>Today&apos;s Weather</h2>
          <p style={{ marginTop: '0.5rem', color: '#666' }}>
            {today.label}
          </p>

          <h2 style={{ fontSize: '3rem', margin: '1rem 0' }}>
            {today.temperature && today.temperature.high != null
              ? `${today.temperature.low}°C – ${today.temperature.high}°C`
              : 'Forecast'}
          </h2>

          <p style={{ fontSize: '1.3rem', color: '#555', marginBottom: '1.5rem' }}>
            {today.weather || 'No description available'}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            <div>
              <h4>🌡 Temperature</h4>
              <p style={{ color: '#555' }}>
                {today.temperature
                  ? `${today.temperature.low}°C – ${today.temperature.high}°C`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <h4>💧 Humidity</h4>
              <p style={{ color: '#555' }}>
                {today.humidity
                  ? `${today.humidity.low}% – ${today.humidity.high}%`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <h4>💨 Wind</h4>
              <p style={{ color: '#555' }}>
                {today.wind
                  ? `${today.wind.speedLow}–${today.wind.speedHigh} km/h ${today.wind.direction || ''}`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Next 4 days forecast */}
      {nextDays.length > 0 && (
        <div className="card">
          <h2>Next 4 Days</h2>
          <div
            className="card-grid"
            style={{ marginTop: '1rem', display: 'grid', gap: '1rem' }}
          >
            {nextDays.map((f, idx) => (
              <div key={idx} className="card" style={{ margin: 0 }}>
                <h3 style={{ marginBottom: '0.25rem' }}>
                  {f.label || `Day ${idx + 1}`}
                </h3>
                <p style={{ color: '#666', marginBottom: '0.75rem' }}>
                  {f.weather}
                </p>
                <p>🌡 {formatRange(f.temperature, '°C')}</p>
                <p>💧 {formatRange(f.humidity, '%')}</p>
                <p>
                  💨{' '}
                  {f.wind
                    ? `${f.wind.speedLow}–${f.wind.speedHigh} km/h ${f.wind.direction || ''}`
                    : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Travel advice block */}
      <div className="card">
        <h2>Travel Advice</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Quick suggestions based on forecasted weather, wind and humidity.
        </p>

        {forecasts.slice(0, 4).map((f, idx) => {
          const weatherAdvice = getWeatherAdvice(f.weather);
          const windAdvice = getWindAdvice(f.wind ? f.wind.speedHigh : null);
          const humidityAdvice = getHumidityAdvice(f.humidity ? f.humidity.high : null);

          return (
            <div key={idx} style={{ marginBottom: '1rem' }}>
              <strong>
                {idx === 0 ? 'Today' : `Day ${idx}: ${f.label || ''}`}
              </strong>
              <ul
                style={{
                  paddingLeft: '1.5rem',
                  marginTop: '0.3rem',
                  lineHeight: 1.7,
                  color: '#555',
                }}
              >
                <li>{weatherAdvice}</li>
                <li>{windAdvice}</li>
                <li>{humidityAdvice}</li>
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Normalise the raw API JSON from Data.gov.sg 4‑day outlook
 * into a simple structure:
 * {
 *   timestamp: string;
 *   forecasts: Array<{
 *     label: string;
 *     weather: string;
 *     temperature: { low: number, high: number };
 *     humidity: { low: number, high: number };
 *     wind: { speedLow: number, speedHigh: number, direction: string };
 *   }>
 * }
 */
function normaliseWeatherResponse(apiData) {
  if (!apiData) return null;

  // Try a few common shapes first, then fall back to a generic search
  let root = null;

  // v2 style: data.records[0]
  if (apiData.data && Array.isArray(apiData.data.records) && apiData.data.records.length > 0) {
    root = apiData.data.records[0];
  }

  // Fallback: data.items[0]
  if (!root && apiData.data && Array.isArray(apiData.data.items) && apiData.data.items.length > 0) {
    root = apiData.data.items[0];
  }

  // Fallback: items[0]
  if (!root && Array.isArray(apiData.items) && apiData.items.length > 0) {
    root = apiData.items[0];
  }

  const forecastsArray =
    (root && Array.isArray(root.forecasts) && root.forecasts) ||
    findForecastArray(apiData);

  if (!forecastsArray || forecastsArray.length === 0) {
    console.warn('Could not locate forecasts array in API response');
    return null;
  }

  const timestamp =
    (root && (root.timestamp || root.update_timestamp)) ||
    apiData.timestamp ||
    (apiData.data && apiData.data.timestamp) ||
    new Date().toISOString();

  const forecasts = forecastsArray.map((f, index) => normaliseForecast(f, index));

  return {
    timestamp,
    forecasts,
  };
}

/**
 * Try to find any property named "forecasts" that looks like an array.
 */
function findForecastArray(obj) {
  if (!obj || typeof obj !== 'object') return null;

  if (Array.isArray(obj.forecasts) && obj.forecasts.length > 0) {
    return obj.forecasts;
  }

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value && typeof value === 'object') {
      const found = findForecastArray(value);
      if (found && found.length > 0) return found;
    }
  }

  return null;
}

function normaliseForecast(forecast, index) {
  // Label / day name
  const label =
    forecast.day ||
    forecast.date ||
    (forecast.timestamp && forecast.timestamp.slice(0, 10)) ||
    `Day ${index + 1}`;

  // Weather / description
  let weatherText = '';
  if (typeof forecast.forecast === 'string') {
    weatherText = forecast.forecast;
  } else if (forecast.forecast && typeof forecast.forecast === 'object') {
    weatherText =
      forecast.forecast.text ||
      forecast.forecast.summary ||
      JSON.stringify(forecast.forecast);
  } else if (forecast.summary) {
    weatherText = forecast.summary;
  } else {
    weatherText = 'No description available';
  }

  // Temperature
  const tempSource = forecast.temperature || forecast.temperatures;
  const temperature = tempSource
    ? {
        low: toNumber(tempSource.low),
        high: toNumber(tempSource.high),
      }
    : null;

  // Humidity
  const humSource =
    forecast.relative_humidity ||
    forecast.relativeHumidity ||
    forecast.humidity;
  const humidity = humSource
    ? {
        low: toNumber(humSource.low),
        high: toNumber(humSource.high),
      }
    : null;

  // Wind
  const windSource = forecast.wind || forecast.winds;
  const speedSource = windSource && (windSource.speed || windSource.speeds);
  const wind = windSource
    ? {
        speedLow: speedSource ? toNumber(speedSource.low) : null,
        speedHigh: speedSource ? toNumber(speedSource.high) : null,
        direction: windSource.direction || '',
      }
    : null;

  return {
    label,
    weather: weatherText,
    temperature,
    humidity,
    wind,
  };
}

function toNumber(val) {
  if (val == null) return null;
  const num = typeof val === 'number' ? val : parseFloat(val);
  return Number.isNaN(num) ? null : num;
}

function formatRange(obj, unit) {
  if (!obj || obj.low == null || obj.high == null) return 'N/A';
  return `${obj.low}${unit} – ${obj.high}${unit}`;
}

function getWeatherAdvice(weatherText) {
  if (!weatherText) return 'Weather is normal, plan your day as usual.';

  const lower = weatherText.toLowerCase();

  if (lower.includes('shower') || lower.includes('rain') || lower.includes('thunder')) {
    return '☔ Expect rain or showers. Carry an umbrella and wear waterproof footwear.';
  }
  if (lower.includes('sunny') || lower.includes('fair') || lower.includes('clear')) {
    return '☀️ Great weather for outdoor attractions. Remember sunscreen and a hat.';
  }
  if (lower.includes('cloud')) {
    return '⛅ Mostly cloudy but generally comfortable. Good for walking tours and light outdoor plans.';
  }
  if (lower.includes('wind')) {
    return '💨 Windy conditions. Secure loose items and be careful with umbrellas.';
  }

  return 'Weather looks fine. Mix of indoor and outdoor activities should be okay.';
}

function getWindAdvice(windSpeedHigh) {
  if (windSpeedHigh == null) return 'Wind speed looks typical for Singapore.';

  const speed = Number(windSpeedHigh);

  if (speed < 10) return 'Breeze is light – very comfortable for outdoor sightseeing and walking.';
  if (speed < 20) return 'Moderate wind – still fine outdoors, just mind lightweight items or hats.';
  if (speed < 30) return 'Wind is a bit stronger. Avoid using large umbrellas in open spaces.';
  return 'Quite windy – consider more indoor activities and be cautious near waterfront areas.';
}

function getHumidityAdvice(humidityHigh) {
  if (humidityHigh == null) {
    return 'Humidity not specified, but Singapore is usually humid – drink plenty of water.';
  }

  const h = Number(humidityHigh);

  if (h < 40) return 'Air is unusually dry – drink water and consider moisturiser if you have dry skin.';
  if (h < 70) return 'Humidity is comfortable – outdoor activities should feel pleasant.';
  if (h < 85) return 'Humidity is high – you may feel sticky, plan for shade and frequent breaks.';
  return 'Humidity is very high – avoid intense outdoor exercise and stay hydrated.';
}

function formatTimestamp(timestamp) {
  if (!timestamp || typeof timestamp !== 'string') return '';
  return timestamp.replace('+08:00', '').replace('T', ' ');
}

export default Weather;
