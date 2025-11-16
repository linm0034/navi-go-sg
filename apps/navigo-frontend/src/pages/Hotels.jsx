import React, { useState, useEffect } from 'react';
import { hotelAPI } from '../services/api';
import Loading from '../components/Loading';

/**
 * Hotels page
 *
 * Requirements:
 * - Support sorting by overall score, price high → low, price low → high.
 * - Support filtering by facility category (hawker, MRT, bus, money changer, attractions, wifi),
 *   matching the backend filter keys used in RankingDAO.
 * - UI layout similar to the dedicated hotel-ranking frontend:
 *   - A filter panel with:
 *       ⭐ Overall Score
 *       💲 Price: High to Low / Low to High
 *       📍 By Facility Category: Hawker, MRT, Bus, Money Changers, Attractions, Wireless Hotspots
 *   - A hotel list on the right.
 */

const FACILITY_FILTERS = [
  { key: 'hawker', label: 'Hawker Centres' },
  { key: 'mrt', label: 'MRT Stations' },
  { key: 'bus', label: 'Bus Stops' },
  { key: 'money', label: 'Money Changers' },
  { key: 'attraction', label: 'Tourist Attractions' },
  { key: 'wifi', label: 'Wireless Hotspots' },
];

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // sortType: overall | price_high | price_low | filter
  const [sortType, setSortType] = useState('overall');
  // active facility filter when sortType === 'filter'
  const [activeFilter, setActiveFilter] = useState(null);

  useEffect(() => {
    // Initial load with default sort/filters
    fetchHotels('overall', null);
  }, []);

  const fetchHotels = async (sort = sortType, filter = activeFilter) => {
    try {
      setLoading(true);
      setError(null);

      const params = { sortType: sort || 'overall' };
      if (filter) {
        params.filter = filter;
      }

      const response = await hotelAPI.getHotels(params);
      setHotels(response.data || []);
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError('Failed to load hotels. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (newSortType, filterKey = null) => {
    setSortType(newSortType);
    setActiveFilter(filterKey);
    fetchHotels(newSortType, filterKey);
  };

  const isFacilityActive = (filterKey) =>
    sortType === 'filter' && activeFilter === filterKey;

  if (loading) return <Loading message="Loading hotels..." />;

  return (
    <div className="hotels-page">
      <div className="page-header">
        <h1>🏨 Hotel Rankings</h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          Discover the best places to stay in Singapore, ranked by overall accessibility and proximity
          to key tourist facilities.
        </p>
      </div>

      <div className="hotels-layout">
        {/* Filter / Sort panel */}
        <aside className="card" style={{ maxWidth: '340px', flexShrink: 0 }}>
          <h2 style={{ marginBottom: '1rem' }}>Sort &amp; Filter</h2>

          {/* Overall score */}
          <div
            style={{
              borderRadius: '999px',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              backgroundColor: sortType === 'overall' ? '#1d4ed8' : '#f5f5f5',
              color: sortType === 'overall' ? '#fff' : '#111',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 600,
            }}
            onClick={() => handleSortChange('overall')}
          >
            <span>⭐</span>
            <span>Overall Score</span>
          </div>

          {/* Price sort */}
          <div className="card" style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Price</p>
            <button
              className="btn"
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                marginBottom: '0.5rem',
                backgroundColor: sortType === 'price_high' ? '#e5edff' : '#fff',
              }}
              onClick={() => handleSortChange('price_high')}
            >
              <span style={{ marginRight: '0.5rem' }}>💲</span>
              Price: High to Low
            </button>
            <button
              className="btn"
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                backgroundColor: sortType === 'price_low' ? '#e5edff' : '#fff',
              }}
              onClick={() => handleSortChange('price_low')}
            >
              <span style={{ marginRight: '0.5rem' }}>💲</span>
              Price: Low to High
            </button>
          </div>

          {/* Facility category filters */}
          <div className="card" style={{ padding: '0.75rem 1rem' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
              <span role="img" aria-label="location" style={{ marginRight: '0.5rem' }}>
                📍
              </span>
              By Facility Category
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {FACILITY_FILTERS.map((f) => (
                <button
                  key={f.key}
                  className="btn"
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    backgroundColor: isFacilityActive(f.key) ? '#e0f2fe' : '#fff',
                  }}
                  onClick={() => handleSortChange('filter', f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Hotels list */}
        <section style={{ flex: 1 }}>
          {error && (
            <div className="card" style={{ marginBottom: '1rem', borderLeft: '4px solid #dc2626' }}>
              <h3 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>Error</h3>
              <p style={{ color: '#991b1b' }}>{error}</p>
            </div>
          )}

          {!hotels || hotels.length === 0 ? (
            <div className="card">
              <p>No hotels found for the selected criteria.</p>
            </div>
          ) : (
            <div className="hotel-grid">
              {hotels.map((hotel, index) => (
                <div key={index} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3>{hotel.name}</h3>
                      <p style={{ color: '#666', fontSize: '0.9rem' }}>
                        Overall Score:{' '}
                        <span style={{ fontWeight: 600 }}>
                          {hotel.overallScore != null ? hotel.overallScore.toFixed(2) : 'N/A'}
                        </span>
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.85rem', color: '#666' }}>Approx. price per night</p>
                      <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                        {hotel.price != null ? `$${Math.round(hotel.price)}` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#666' }}>
                    <p>
                      📍 Latitude: {hotel.latitude?.toFixed ? hotel.latitude.toFixed(4) : hotel.latitude},{' '}
                      Longitude: {hotel.longitude?.toFixed ? hotel.longitude.toFixed(4) : hotel.longitude}
                    </p>
                  </div>

                  {hotel.filterScores && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        Facility Proximity Scores (0–10)
                      </p>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                          gap: '0.5rem',
                          fontSize: '0.85rem',
                        }}
                      >
                        {FACILITY_FILTERS.map((f) => {
                          const value = hotel.filterScores[f.key];
                          return (
                            <div
                              key={f.key}
                              style={{
                                padding: '0.4rem 0.6rem',
                                borderRadius: '999px',
                                backgroundColor: '#f9fafb',
                              }}
                            >
                              <strong>{f.label}:</strong>{' '}
                              {value != null ? value.toFixed(2) : 'N/A'}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Hotels;
