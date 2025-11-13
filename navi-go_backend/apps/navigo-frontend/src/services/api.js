import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
};

// Rewards API
export const rewardsAPI = {
  getRewards: () => api.get('/rewards/show'),
  redeemReward: (rewardId) => api.post(`/rewards/redeem/${rewardId}`),
  getUserRewards: () => api.get('/rewards/me'),
};

// Weather API
export const weatherAPI = {
  getCurrentWeather: () => api.get('/weather'),
  getForecast: () => api.get('/weather/forecast'),
};

// Heatmap API
export const heatmapAPI = {
  getInfo: () => api.get('/heatmap'),
  getStations: () => api.get('/heatmap/stations', { responseType: 'text' }),
  getCrowdData: () => api.get('/heatmap/crowd', { responseType: 'text' }),
  getTaxiData: () => api.get('/heatmap/taxi', { responseType: 'text' }),
  getMergedData: () => api.get('/heatmap/merged', { responseType: 'text' }),
};

// Booking API
export const bookingAPI = {
  getBookings: () => api.get('/booking'),
  createBooking: (bookingData) => api.post('/booking', bookingData),
  getBookingById: (id) => api.get(`/booking/${id}`),
  cancelBooking: (id) => api.delete(`/booking/${id}`),
};

// Hotel Ranking API
export const hotelAPI = {
  getHotels: () => api.get('/ranking'),
  getHotelById: (id) => api.get(`/ranking/${id}`),
  searchHotels: (params) => api.get('/ranking/search', { params }),
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: (message) => api.post('/chat', { message }),
  initChat: () => api.post('/chat', {}),
};

export default api;
