import express from 'express';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { v4 as uuid } from 'uuid';

const app = express();

// Assign a request ID for tracing across services
app.use((req, res, next) => {
  const id = req.header('x-request-id') || uuid();
  req.headers['x-request-id'] = id;
  res.setHeader('x-request-id', id);
  next();
});

app.use(morgan('combined'));

// Explicitly mount proxies on path prefixes instead of using a filter function.
// This avoids subtle mismatches and ensures each service receives the correct path.

// Auth and rewards: forward all /api/auth/* and /api/rewards/* requests to the auth-api service
app.use(
  '/api/auth',
  createProxyMiddleware({
    target: `http://auth-api:${process.env.AUTH_PORT || 4011}`,
    changeOrigin: true
    // Do not rewrite the path — /api/auth/login and /api/auth/register are handled by the auth service
  })
);
app.use(
  '/api/rewards',
  createProxyMiddleware({
    target: `http://auth-api:${process.env.AUTH_PORT || 4011}`,
    changeOrigin: true
    // Rewards endpoints live at /api/rewards/show and /api/rewards/redeem
  })
);

// Weather: strip the /api/weather prefix so that `/api/weather` maps to the root of the weather API
app.use(
  '/api/weather',
  createProxyMiddleware({
    target: `http://weather-api:${process.env.WEATHER_PORT || 4013}`,
    changeOrigin: true,
    pathRewrite: { '^/api/weather': '' }
  })
);

// Heatmap: strip the /api/heatmap prefix for endpoints such as /crowd, /stations, /taxi, /merged
app.use(
  '/api/heatmap',
  createProxyMiddleware({
    target: `http://heatmap-api:${process.env.HEATMAP_PORT || 4014}`,
    changeOrigin: true,
    pathRewrite: { '^/api/heatmap': '' }
  })
);

// Booking: strip the /api/booking prefix so that /api/booking becomes the root of the booking API
app.use(
  '/api/booking',
  createProxyMiddleware({
    target: `http://booking-api:${process.env.BOOKING_PORT || 4015}`,
    changeOrigin: true,
    pathRewrite: { '^/api/booking': '' }
  })
);

// Ranking: strip the /api/ranking prefix. The ranking API exposes its main GET at the root.
app.use(
  '/api/ranking',
  createProxyMiddleware({
    target: `http://hotel-ranking-api:${process.env.HOTEL_PORT || 4016}`,
    changeOrigin: true,
    pathRewrite: { '^/api/ranking': '' }
  })
);

// Hotels (alias for ranking): strip the /api/hotels prefix
app.use(
  '/api/hotels',
  createProxyMiddleware({
    target: `http://hotel-ranking-api:${process.env.HOTEL_PORT || 4016}`,
    changeOrigin: true,
    pathRewrite: { '^/api/hotels': '' }
  })
);

// Chatbot: strip the /api/chatbot prefix so it reaches the root of the chatbot API
app.use(
  '/api/chatbot',
  createProxyMiddleware({
    target: `http://chatbot-api:${process.env.CHATBOT_PORT || 4017}`,
    changeOrigin: true,
    pathRewrite: { '^/api/chatbot': '' }
  })
);

// Chat (alias for chatbot): strip the /api/chat prefix. The chatbot controller maps to the root.
app.use(
  '/api/chat',
  createProxyMiddleware({
    target: `http://chatbot-api:${process.env.CHATBOT_PORT || 4017}`,
    changeOrigin: true,
    pathRewrite: { '^/api/chat': '' }
  })
);

// Simple health check endpoint
app.get('/healthz', (_, res) => {
  res.json({ ok: true });
});

const port = process.env.GATEWAY_PORT || 4000;
app.listen(port, () => {
  console.log(`Gateway listening on ${port}`);
});
