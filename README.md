# Singapore Tourist Guide - Complete System

A comprehensive microservices-based tourist guide application for Singapore, featuring hotel recommendations, weather updates, crowd monitoring, AI chatbot assistance, rewards program, and more.

## 🌟 Features

### Frontend Application - NAVI-GO SG
- 🏨 **Hotel Rankings** - Browse and search hotels with ratings and amenities
- 🌤️ **Weather Forecast** - Real-time weather conditions and forecasts
- 🗺️ **Crowd Heatmap** - MRT/LRT crowd density and taxi availability
- 💬 **AI Chatbot** - Get instant answers about Singapore tourism
- 🎁 **Rewards Program** - Earn and redeem points for exploring
- 📍 **Hotel Map** - Interactive map of hotel locations

### Backend Services
- **Auth API** - User authentication and authorization
- **Weather API** - Real-time weather data
- **Heatmap API** - Crowd density and taxi availability
- **Booking API** - Hotel booking management
- **Hotel Ranking API** - Hotel information and rankings
- **Chatbot API** - AI-powered tourist assistant
- **Gateway** - Unified API gateway

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│         NAVI-GO SG Frontend (3000)              │
│         React Application                       │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│              Gateway (4000)                     │
├─────────────────────────────────────────────────┤
│  /api/auth      → Auth API (4011)              │
│  /api/rewards   → Auth API (4011)              │
│  /api/weather   → Weather API (4013)            │
│  /api/heatmap   → Heatmap API (4014)            │
│  /api/booking   → Booking API (4015)            │
│  /api/ranking   → Hotel Ranking API (4016)      │
│  /api/chat      → Chatbot API (4017)            │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│         MySQL (3307) + Redis (6379)             │
│         Database and Cache Services             │
└─────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd singapore-tourist-guide
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

3. **Start all services**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Gateway: http://localhost:4000
   - Map Frontend: http://localhost:5173

### First Time Setup

Wait for all services to start (approximately 2-3 minutes). You can check the status with:

```bash
docker-compose ps
```

All services should show "Up" status.

## 📦 Services Overview

| Service | Port | Technology | Description |
|---------|------|------------|-------------|
| **NAVI-GO Frontend** | 3000 | React + Vite | Main web application |
| Gateway | 4000 | Node.js + Express | API gateway |
| Auth API | 4011 | Java Spring Boot | Authentication & rewards |
| Weather API | 4013 | Node.js | Weather data |
| Heatmap API | 4014 | Node.js | Crowd & taxi data |
| Booking API | 4015 | Node.js | Hotel bookings |
| Hotel Ranking API | 4016 | Java Spring Boot | Hotel information |
| Chatbot API | 4017 | Java Spring Boot | AI assistant |
| Map Frontend | 5173 | React + Vite | Hotel map visualization |
| MySQL | 3307 | MySQL 8.4 | Database |
| Redis | 6379 | Redis 7 | Cache |

## 🧪 Testing

### Test Frontend

```bash
# Open in browser
open http://localhost:3000

# Or test with curl
curl http://localhost:3000
```

### Test Backend APIs

```bash
# Test Gateway
curl http://localhost:4000/healthz

# Test Hotel Rankings
curl http://localhost:4000/api/ranking

# Test Weather
curl http://localhost:4000/api/weather

# Test Heatmap
curl http://localhost:4000/api/heatmap

# Test Chatbot
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'

# Test Auth - Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Test Auth - Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Test Rewards
curl http://localhost:4000/api/rewards/show
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=tourist
MYSQL_USER=tourist
MYSQL_PASSWORD=tourist

# Google Maps API Key (optional, for map features)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Other service-specific configurations
```

### Google Maps API Key

To enable the map features:

1. Get an API key from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Enable Maps JavaScript API
3. Add the key to `.env`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```
4. Restart the frontend services:
   ```bash
   docker-compose restart navigo-frontend map-frontend
   ```

## 🛠️ Development

### Local Development (Frontend)

```bash
cd apps/navigo-frontend
npm install
npm run dev
```

### Local Development (Backend Services)

Each service can be run independently. See individual service README files for details.

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f navigo-frontend
docker-compose logs -f gateway
docker-compose logs -f auth-api
```

### Rebuilding Services

```bash
# Rebuild all
docker-compose up --build

# Rebuild specific service
docker-compose up --build navigo-frontend

# Force rebuild without cache
docker-compose build --no-cache navigo-frontend
docker-compose up navigo-frontend
```

## 📚 Documentation

- [Setup Guide](SETUP_GUIDE.md) - Detailed setup instructions
- [Fixes Applied](FIXES_APPLIED.md) - List of bug fixes and improvements
- [New Features](NEW_FEATURES.md) - Documentation for new features
- [Frontend README](apps/navigo-frontend/README.md) - Frontend-specific documentation

## 🐛 Troubleshooting

### Services Not Starting

```bash
# Check service status
docker-compose ps

# View logs for failed service
docker-compose logs <service-name>

# Restart specific service
docker-compose restart <service-name>
```

### Port Conflicts

If ports are already in use, modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Change host port (left side)
```

### Database Connection Issues

```bash
# Check MySQL is healthy
docker-compose ps mysql

# Reset database
docker-compose down -v
docker-compose up mysql
```

### Frontend Not Loading

```bash
# Clear browser cache
# Check if gateway is running
docker-compose ps gateway

# Restart frontend
docker-compose restart navigo-frontend
```

## 🔄 Updates and Maintenance

### Updating Dependencies

```bash
# Update frontend dependencies
cd apps/navigo-frontend
npm update

# Rebuild
docker-compose up --build navigo-frontend
```

### Cleaning Up

```bash
# Stop all services
docker-compose down

# Remove volumes (database data)
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Clean build cache
docker builder prune -a -f
```

## 🌐 Production Deployment

### Security Considerations

1. **Change default passwords** in `.env`
2. **Restrict CORS origins** in gateway and API services
3. **Use HTTPS** with proper SSL certificates
4. **Set up firewall rules** to restrict access
5. **Enable authentication** for all sensitive endpoints
6. **Use environment-specific configurations**

### Scaling

Services can be scaled using Docker Compose:

```bash
docker-compose up --scale hotel-ranking-api=3
```

## 📄 License

This project is part of the Singapore Tourist Guide system.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For issues and questions:
- Check the [Setup Guide](SETUP_GUIDE.md)
- Review [Troubleshooting](#troubleshooting) section
- Check service logs: `docker-compose logs <service-name>`

## 🎯 Roadmap

- [ ] User authentication and profiles
- [ ] Booking system integration
- [ ] Real-time notifications
- [ ] Mobile app version
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

---

**NAVI-GO SG** - Your Ultimate Singapore Tourist Guide 🇸🇬
