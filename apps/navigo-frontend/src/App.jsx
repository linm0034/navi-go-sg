import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Hotels from './pages/Hotels';
import Weather from './pages/Weather';
import Heatmap from './pages/Heatmap';
import Chatbot from './pages/Chatbot';
import Rewards from './pages/Rewards';
import HotelMap from './pages/HotelMap';
import Login from './pages/Login';
import Register from './pages/Register';
import Booking from './pages/Booking';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/hotels" element={<Hotels />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/heatmap" element={<Heatmap />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/chatbot" element={<Chatbot />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/map" element={<Navigate to="http://localhost:5173" />} />
              {/* <Route path="/map" element={<HotelMap />} /> */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;