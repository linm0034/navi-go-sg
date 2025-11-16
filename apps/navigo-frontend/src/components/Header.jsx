import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <span className="logo-icon">🧭</span>
          <span>NAVI-GO SG</span>
        </Link>
        <nav className="nav">
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            Home
          </Link>
          <Link to="/hotels" className={`nav-link ${isActive('/hotels')}`}>
            Hotels
          </Link>
          <Link to="/weather" className={`nav-link ${isActive('/weather')}`}>
            Weather
          </Link>
          <Link to="/heatmap" className={`nav-link ${isActive('/heatmap')}`}>
          <Link to="/booking" className={`nav-link ${isActive('/booking')}`}>
            Booking
          </Link>
            Heatmap
          </Link>
          <Link to="/chatbot" className={`nav-link ${isActive('/chatbot')}`}>
            Chatbot
          </Link>
          <Link to="/rewards" className={`nav-link ${isActive('/rewards')}`}>
            Rewards
          </Link>
          
          {user ? (
            <div className="user-menu">
              <button 
                className="user-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="user-icon">👤</span>
                <span>{user.username}</span>
              </button>
              {showUserMenu && (
                <div className="user-dropdown">
                  <Link 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/rewards" 
                    className="dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    My Rewards
                  </Link>
                  <button 
                    className="dropdown-item logout-btn"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className={`nav-link ${isActive('/login')}`}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;