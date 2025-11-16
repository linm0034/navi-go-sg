import React, { useState, useEffect } from 'react';
import { heatmapAPI } from '../services/api';
import Loading from '../components/Loading';

const Heatmap = () => {
  const [heatmapData, setHeatmapData] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchHeatmapData();
  }, []);

  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      const [infoResponse, stationsResponse] = await Promise.all([
        heatmapAPI.getInfo(),
        heatmapAPI.getStations().catch(() => ({ data: null }))
      ]);
      setHeatmapData(infoResponse.data);
      if (stationsResponse.data) {
        // Parse CSV data if needed
        setStations([]);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load heatmap data. Please try again later.');
      console.error('Error fetching heatmap:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading heatmap data..." />;

  if (error) {
    return (
      <div className="card">
        <div className="error">{error}</div>
        <button onClick={fetchHeatmapData} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="heatmap-page">
      <div className="card">
        <h1>🗺️ Crowd Heatmap</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Real-time crowd density at MRT/LRT stations and taxi availability across Singapore
        </p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${activeTab === 'info' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('info')}
          >
            📊 Overview
          </button>
          <button 
            className={`btn ${activeTab === 'stations' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('stations')}
          >
            🚇 MRT Stations
          </button>
          <button 
            className={`btn ${activeTab === 'crowd' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('crowd')}
          >
            👥 Crowd Data
          </button>
          <button 
            className={`btn ${activeTab === 'taxi' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('taxi')}
          >
            🚕 Taxi Availability
          </button>
        </div>

        {activeTab === 'info' && heatmapData && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Available Data</h3>
            {heatmapData.endpoints && (
              <div style={{ marginBottom: '2rem' }}>
                <h4>API Endpoints:</h4>
                <ul style={{ lineHeight: '2', color: '#666' }}>
                  {Object.entries(heatmapData.endpoints).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong> {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {heatmapData.dataFiles && (
              <div>
                <h4>Data Files:</h4>
                <ul style={{ lineHeight: '2', color: '#666' }}>
                  {heatmapData.dataFiles.map((file, index) => (
                    <li key={index}>{file}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stations' && (
          <div>
            <h3>MRT/LRT Stations</h3>
            <p style={{ color: '#666', marginTop: '1rem' }}>
              View real-time data for all MRT and LRT stations across Singapore.
            </p>
            <div style={{ 
              marginTop: '2rem', 
              padding: '2rem', 
              background: '#f5f5f5', 
              borderRadius: 'var(--border-radius)',
              textAlign: 'center'
            }}>
              <p>🚇 Station data visualization coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'crowd' && (
  <div>
    <h3>Real-time Crowd Heatmap</h3>
    <p style={{ color: '#666', marginTop: '1rem' }}>
      This map is served by the heatmap-api service and embedded through the gateway.
    </p>
    <div
      style={{
        marginTop: '1rem',
        borderRadius: 'var(--border-radius)',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        height: '500px',
      }}
    >
      <iframe
        title="Crowd Heatmap"
        src="/api/heatmap"
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  </div>
)}


        {activeTab === 'taxi' && (
          <div>
            <h3>Taxi Availability</h3>
            <p style={{ color: '#666', marginTop: '1rem' }}>
              Find available taxis near you in real-time.
            </p>
            <div style={{ 
              marginTop: '2rem', 
              padding: '2rem', 
              background: '#f5f5f5', 
              borderRadius: 'var(--border-radius)',
              textAlign: 'center'
            }}>
              <p>🚕 Taxi location map coming soon...</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Heatmap;
