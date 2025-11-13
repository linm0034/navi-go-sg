import React, { useState, useEffect, useMemo } from 'react';
import { heatmapAPI } from '../services/api';
import Loading from '../components/Loading';
import { parseCsv, calculateNumericSummary } from '../utils/csv';

const CROWD_LABELS = {
  l: 'Low',
  low: 'Low',
  m: 'Moderate',
  medium: 'Moderate',
  h: 'High',
  high: 'High',
};

const getCrowdBucket = (value) => {
  if (value === null || value === undefined) {
    return 'Unknown';
  }

  const normalized = String(value).trim().toLowerCase();
  if (CROWD_LABELS[normalized]) {
    return CROWD_LABELS[normalized];
  }

  const numeric = Number(normalized);
  if (!Number.isNaN(numeric)) {
    if (numeric < 0.33) return 'Low';
    if (numeric < 0.66) return 'Moderate';
    return 'High';
  }

  return 'Unknown';
};

const formatHeader = (header) =>
  String(header)
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatCoordinate = (value) => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const numeric = Number(value);
  if (!Number.isNaN(numeric)) {
    return numeric.toFixed(4);
  }

  return value;
};

const formatCrowdLevel = (value) => {
  const bucket = getCrowdBucket(value);
  switch (bucket) {
    case 'Low':
      return 'Low';
    case 'Moderate':
      return 'Moderate';
    case 'High':
      return 'High';
    default:
      return 'Unknown';
  }
};

const Heatmap = () => {
  const [heatmapData, setHeatmapData] = useState(null);
  const [stations, setStations] = useState([]);
  const [crowdData, setCrowdData] = useState([]);
  const [taxiData, setTaxiData] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [stationQuery, setStationQuery] = useState('');

  useEffect(() => {
    fetchHeatmapData();
  }, []);

  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      const [
        infoResponse,
        stationsResponse,
        crowdResponse,
        taxiResponse,
        mergedResponse
      ] = await Promise.all([
        heatmapAPI.getInfo().catch((err) => {
          console.warn('Unable to fetch heatmap info', err);
          return null;
        }),
        heatmapAPI.getStations().catch((err) => {
          console.warn('Unable to fetch stations data', err);
          return null;
        }),
        heatmapAPI.getCrowdData().catch((err) => {
          console.warn('Unable to fetch crowd data', err);
          return null;
        }),
        heatmapAPI.getTaxiData().catch((err) => {
          console.warn('Unable to fetch taxi data', err);
          return null;
        }),
        heatmapAPI.getMergedData().catch((err) => {
          console.warn('Unable to fetch merged dataset', err);
          return null;
        })
      ]);

      setHeatmapData(infoResponse?.data || null);
      setStations(stationsResponse?.data ? parseCsv(stationsResponse.data) : []);
      setCrowdData(crowdResponse?.data ? parseCsv(crowdResponse.data, { convertNumbers: false }) : []);
      setTaxiData(taxiResponse?.data ? parseCsv(taxiResponse.data) : []);
      setMergedData(mergedResponse?.data ? parseCsv(mergedResponse.data) : []);

      if (!stationsResponse && !crowdResponse && !taxiResponse && !mergedResponse) {
        setError('Heatmap datasets are unavailable right now.');
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching heatmap:', err);
      setError('Failed to load heatmap data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStations = useMemo(() => {
    if (!stationQuery) {
      return stations;
    }

    const query = stationQuery.toLowerCase();
    return stations.filter((station) =>
      Object.values(station).some((value) =>
        value !== null &&
        value !== undefined &&
        String(value).toLowerCase().includes(query)
      )
    );
  }, [stationQuery, stations]);

  const stationHeaders = useMemo(() => {
    if (stations.length === 0) {
      return [];
    }
    return Object.keys(stations[0]);
  }, [stations]);

  const crowdDistribution = useMemo(() => {
    if (crowdData.length === 0) {
      return {};
    }

    return crowdData.reduce((acc, entry) => {
      const bucket = getCrowdBucket(entry.CrowdLevel);
      acc[bucket] = (acc[bucket] || 0) + 1;
      return acc;
    }, {});
  }, [crowdData]);

  const taxiBounds = useMemo(() => {
    if (taxiData.length === 0) {
      return null;
    }

    const latitudes = taxiData
      .map((item) => Number(item.Latitude))
      .filter((value) => !Number.isNaN(value));
    const longitudes = taxiData
      .map((item) => Number(item.Longitude))
      .filter((value) => !Number.isNaN(value));

    if (latitudes.length === 0 || longitudes.length === 0) {
      return null;
    }

    return {
      minLat: Math.min(...latitudes),
      maxLat: Math.max(...latitudes),
      minLng: Math.min(...longitudes),
      maxLng: Math.max(...longitudes),
    };
  }, [taxiData]);

  const mergedCrowdSummary = useMemo(
    () => calculateNumericSummary(mergedData, 'CrowdLevel'),
    [mergedData]
  );

  const topCrowdedStations = useMemo(() => {
    if (mergedData.length === 0) {
      return [];
    }

    return mergedData
      .map((entry) => ({
        ...entry,
        _numericLevel: Number(entry.CrowdLevel),
      }))
      .filter((entry) => !Number.isNaN(entry._numericLevel))
      .sort((a, b) => b._numericLevel - a._numericLevel)
      .slice(0, 10);
  }, [mergedData]);

  const summaryStats = useMemo(
    () => [
      { label: 'Stations tracked', value: stations.length },
      { label: 'Crowd datapoints', value: crowdData.length },
      { label: 'Taxi coordinates', value: taxiData.length },
      { label: 'Merged records', value: mergedData.length },
    ],
    [stations.length, crowdData.length, taxiData.length, mergedData.length]
  );

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
        <div className="card-actions">
          <div>
            <h1>🗺️ Crowd Heatmap</h1>
            <p style={{ color: '#666', marginTop: '0.5rem' }}>
              Real-time crowd density at MRT/LRT stations and taxi availability across Singapore
            </p>
          </div>
          <button className="btn btn-secondary" onClick={fetchHeatmapData}>
            🔄 Refresh data
          </button>
        </div>

        {summaryStats.length > 0 && (
          <div className="stats-grid">
            {summaryStats.map((stat) => (
              <div key={stat.label} className="stat-card">
                <h4>{stat.label}</h4>
                <p>{stat.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="tab-buttons">
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
          <button
            className={`btn ${activeTab === 'merged' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('merged')}
          >
            🔀 Combined View
          </button>
        </div>

        {activeTab === 'info' && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Available Data</h3>
            {heatmapData?.endpoints && (
              <div style={{ marginBottom: '2rem' }}>
                <h4>API Endpoints</h4>
                <ul style={{ lineHeight: '2', color: '#666' }}>
                  {Object.entries(heatmapData.endpoints).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong> {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {heatmapData?.dataFiles && (
              <div>
                <h4>Data Files</h4>
                <ul style={{ lineHeight: '2', color: '#666' }}>
                  {heatmapData.dataFiles.map((file) => (
                    <li key={file}>{file}</li>
                  ))}
                </ul>
              </div>
            )}

            {mergedCrowdSummary && (
              <div className="dataset-meta" style={{ marginTop: '2rem' }}>
                <span>
                  Average crowd index:{' '}
                  <strong>{mergedCrowdSummary.average.toFixed(2)}</strong>
                </span>
                <span>
                  Peak crowd index:{' '}
                  <strong>{mergedCrowdSummary.max.toFixed(2)}</strong>
                </span>
                <span>
                  Data points analysed:{' '}
                  <strong>{mergedCrowdSummary.count}</strong>
                </span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stations' && (
          <div>
            <h3>MRT/LRT Stations</h3>
            <p style={{ color: '#666', margin: '1rem 0 1.5rem' }}>
              Search and explore the full list of MRT and LRT stations captured in the dataset.
            </p>

            <input
              type="search"
              className="search-input"
              placeholder="Search for a station name or code..."
              value={stationQuery}
              onChange={(event) => setStationQuery(event.target.value)}
            />

            <div className="dataset-meta">
              <span>
                Showing <strong>{filteredStations.length}</strong> of{' '}
                <strong>{stations.length}</strong> stations
              </span>
            </div>

            {filteredStations.length === 0 ? (
              <p style={{ color: '#666' }}>No stations matched your search.</p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      {stationHeaders.map((header) => (
                        <th key={header}>{formatHeader(header)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStations.slice(0, 100).map((station, index) => (
                      <tr key={`${station.STN_NO || station.Index || index}-${index}`}>
                        {stationHeaders.map((header) => {
                          const value = station[header];

                          if (header === 'Latitude' || header === 'Longitude') {
                            return <td key={header}>{formatCoordinate(value)}</td>;
                          }

                          return <td key={header}>{value || '—'}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'crowd' && (
          <div>
            <h3>Crowd Density</h3>
            <p style={{ color: '#666', margin: '1rem 0 1.5rem' }}>
              Real-time crowd density information to help you plan your journey across Singapore.
            </p>

            {Object.keys(crowdDistribution).length > 0 && (
              <div className="stats-grid">
                {Object.entries(crowdDistribution).map(([bucket, value]) => (
                  <div key={bucket} className="stat-card">
                    <h4>{bucket} crowd level</h4>
                    <p>{value}</p>
                  </div>
                ))}
              </div>
            )}

            {crowdData.length === 0 ? (
              <p style={{ color: '#666' }}>Crowd data is unavailable at the moment.</p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Station Code</th>
                      <th>Crowd Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crowdData.slice(0, 120).map((entry, index) => {
                      const bucket = getCrowdBucket(entry.CrowdLevel);
                      const badgeClass =
                        bucket === 'High'
                          ? 'badge badge-danger'
                          : bucket === 'Moderate'
                          ? 'badge badge-warning'
                          : bucket === 'Low'
                          ? 'badge badge-success'
                          : 'badge';

                      return (
                        <tr key={`${entry.STN_NO || index}-${index}`}>
                          <td>{entry.STN_NO || entry.Station || '—'}</td>
                          <td>
                            <span className={badgeClass}>{formatCrowdLevel(entry.CrowdLevel)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'taxi' && (
          <div>
            <h3>Taxi Availability</h3>
            <p style={{ color: '#666', margin: '1rem 0 1.5rem' }}>
              GPS locations of available taxis reported across Singapore.
            </p>

            <div className="dataset-meta">
              <span>
                Total coordinates captured: <strong>{taxiData.length}</strong>
              </span>
              {taxiBounds && (
                <>
                  <span>
                    Latitude range: <strong>{taxiBounds.minLat.toFixed(3)}</strong> to{' '}
                    <strong>{taxiBounds.maxLat.toFixed(3)}</strong>
                  </span>
                  <span>
                    Longitude range: <strong>{taxiBounds.minLng.toFixed(3)}</strong> to{' '}
                    <strong>{taxiBounds.maxLng.toFixed(3)}</strong>
                  </span>
                </>
              )}
            </div>

            {taxiData.length === 0 ? (
              <p style={{ color: '#666' }}>Taxi availability data is unavailable right now.</p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Longitude</th>
                      <th>Latitude</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxiData.slice(0, 120).map((entry, index) => (
                      <tr key={`${entry.Longitude}-${entry.Latitude}-${index}`}>
                        <td>{formatCoordinate(entry.Longitude)}</td>
                        <td>{formatCoordinate(entry.Latitude)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'merged' && (
          <div>
            <h3>Combined View</h3>
            <p style={{ color: '#666', margin: '1rem 0 1.5rem' }}>
              Stations enriched with both location and crowd information. Higher scores indicate busier locations.
            </p>

            {topCrowdedStations.length === 0 ? (
              <p style={{ color: '#666' }}>Combined station data is unavailable right now.</p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Station</th>
                      <th>Code</th>
                      <th>Latitude</th>
                      <th>Longitude</th>
                      <th>Crowd Index</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCrowdedStations.map((entry, index) => (
                      <tr key={`${entry.STN_NO || index}-${index}`}>
                        <td>{entry.STN_NAME || '—'}</td>
                        <td>{entry.STN_NO || '—'}</td>
                        <td>{formatCoordinate(entry.Latitude)}</td>
                        <td>{formatCoordinate(entry.Longitude)}</td>
                        <td>
                          <span className="badge badge-danger">
                            {typeof entry._numericLevel === 'number'
                              ? entry._numericLevel.toFixed(2)
                              : entry.CrowdLevel || '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h3>About Heatmap Data</h3>
        <p style={{ lineHeight: '1.8', color: '#666' }}>
          Our heatmap feature provides real-time crowd density information from Singapore's
          MRT and LRT stations, as well as taxi availability data. This helps you plan your
          journey and avoid crowded areas during peak hours.
        </p>
      </div>
    </div>
  );
};

export default Heatmap;
