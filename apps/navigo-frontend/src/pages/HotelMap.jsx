import React from 'react';

const HotelMap = () => {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  return (
    <div className="hotel-map-page">
      <div className="card">
        <h1>📍 Hotel Locations Map</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Interactive map showing all hotel locations across Singapore
        </p>
      </div>

      <div className="card">
        {!googleMapsApiKey ? (
          <div style={{ 
            padding: '3rem', 
            textAlign: 'center',
            background: '#fff3cd',
            borderRadius: 'var(--border-radius)'
          }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</p>
            <h3 style={{ marginBottom: '1rem' }}>Google Maps API Key Required</h3>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              To view the interactive hotel map, please configure your Google Maps API key.
            </p>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to your environment variables.
            </p>
          </div>
        ) : (
          <div style={{ 
            width: '100%', 
            height: '600px', 
            background: '#f5f5f5',
            borderRadius: 'var(--border-radius)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</p>
              <p style={{ color: '#666' }}>
                Map integration coming soon...
              </p>
              <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                This will display an interactive Google Maps view with hotel markers
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Featured Hotel Areas</h3>
        <div className="feature-grid">
          <div className="card">
            <h4 style={{ color: 'var(--primary-color)' }}>Marina Bay</h4>
            <p style={{ color: '#666' }}>
              Luxury hotels with stunning waterfront views and proximity to major attractions
            </p>
          </div>
          <div className="card">
            <h4 style={{ color: 'var(--primary-color)' }}>Orchard Road</h4>
            <p style={{ color: '#666' }}>
              Shopping district with numerous hotels ranging from budget to luxury
            </p>
          </div>
          <div className="card">
            <h4 style={{ color: 'var(--primary-color)' }}>Sentosa Island</h4>
            <p style={{ color: '#666' }}>
              Resort hotels perfect for beach lovers and family vacations
            </p>
          </div>
          <div className="card">
            <h4 style={{ color: 'var(--primary-color)' }}>Chinatown</h4>
            <p style={{ color: '#666' }}>
              Budget-friendly hotels with rich cultural experiences
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelMap;
