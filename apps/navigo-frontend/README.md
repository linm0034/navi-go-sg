# NAVI-GO SG - Singapore Tourist Guide

A comprehensive React-based web application for exploring Singapore, featuring hotel recommendations, weather updates, crowd monitoring, AI chatbot assistance, and a rewards program.

## Features

- 🏨 **Hotel Rankings** - Browse and search hotels with ratings and amenities
- 🌤️ **Weather Forecast** - Real-time weather conditions and forecasts
- 🗺️ **Crowd Heatmap** - MRT/LRT crowd density and taxi availability
- 💬 **AI Chatbot** - Get instant answers about Singapore tourism
- 🎁 **Rewards Program** - Earn and redeem points for exploring
- 📍 **Hotel Map** - Interactive map of hotel locations

## Tech Stack

- **Frontend**: React 18
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Styling**: CSS3 with CSS Variables

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for full stack deployment)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Environment Variables

Create a `.env` file with the following variables:

```env
VITE_API_BASE_URL=/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
navigo-frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Loading.jsx
│   ├── pages/           # Page components
│   │   ├── Home.jsx
│   │   ├── Hotels.jsx
│   │   ├── Weather.jsx
│   │   ├── Heatmap.jsx
│   │   ├── Chatbot.jsx
│   │   ├── Rewards.jsx
│   │   └── HotelMap.jsx
│   ├── services/        # API services
│   │   └── api.js
│   ├── styles/          # CSS styles
│   │   └── App.css
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── public/              # Static assets
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── package.json         # Dependencies
└── Dockerfile           # Docker configuration
```

## API Integration

The application integrates with the following backend services:

- **Auth API** (Port 4011) - Authentication and user management
- **Weather API** (Port 4013) - Weather data
- **Heatmap API** (Port 4014) - Crowd and taxi data
- **Booking API** (Port 4015) - Hotel bookings
- **Hotel Ranking API** (Port 4016) - Hotel information
- **Chatbot API** (Port 4017) - AI assistant

All API requests are proxied through the Gateway (Port 4000) with the `/api` prefix.

## Docker Deployment

The application includes a Dockerfile for containerized deployment:

```bash
# Build image
docker build -t navigo-frontend .

# Run container
docker run -p 3000:3000 navigo-frontend
```

Or use with docker-compose (see main project README).

## Development

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route in `src/App.jsx`
3. Update navigation in `src/components/Header.jsx`

### Adding New API Services

1. Add service methods in `src/services/api.js`
2. Import and use in page components

### Styling

The application uses CSS variables for theming. Main colors can be customized in `src/styles/App.css`:

```css
:root {
  --primary-color: #FF6B6B;
  --secondary-color: #4ECDC4;
  --accent-color: #FFE66D;
  /* ... */
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is part of the Singapore Tourist Guide system.

## Support

For issues and questions, please refer to the main project documentation.
