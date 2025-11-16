export interface Temperature {
  low: number;
  high: number;
}

export interface Humidity {
  low: number;
  high: number;
}

export interface Wind {
  speedLow: number;
  speedHigh: number;
  direction: string;
}

export interface DayForecast {
  date: string;
  weather: string;
  temperature: Temperature;
  humidity: Humidity;
  wind: Wind;
}

export interface WeatherInfo {
  location: string;
  timestamp: string;
  forecasts: DayForecast[];
}

// API响应类型
export interface WeatherAPIResponse {
  data: {
    records: Array<{
      timestamp: string;
      date: string;
      forecasts: Array<{
        day: string;
        forecast: {
          text: string;
          summary: string;
        };
        temperature: {
          low: number;
          high: number;
        };
        relativeHumidity: {
          low: number;
          high: number;
        };
        wind: {
          speed: {
            low: number;
            high: number;
          };
          direction: string;
        };
      }>;
    }>;
  };
}
