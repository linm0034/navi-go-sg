import express from 'express';
import fetch from 'node-fetch';

const app = express();

// The Singapore 4-day weather outlook API endpoint
const API_URL = 'https://api-open.data.gov.sg/v2/real-time/api/four-day-outlook';

/**
 * GET /
 * Fetches the 4‑day weather outlook from the Singapore government open data portal and
 * returns the raw JSON response. This simple proxy avoids CORS issues on the frontend
 * and allows all callers.
 */
app.get('/', async (_req, res) => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: `Failed to fetch weather data. Status ${response.status}` });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server on the configured port or default to 4013
const port = process.env.WEATHER_PORT || 4013;
app.listen(port, () => {
  console.log(`Weather API listening on ${port}`);
});