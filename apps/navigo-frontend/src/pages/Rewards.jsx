import React, { useState, useEffect } from 'react';
import { rewardsAPI } from '../services/api';
import Loading from '../components/Loading';

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await rewardsAPI.getRewards();
      // Handle different response formats
      if (Array.isArray(response.data)) {
        setRewards(response.data);
      } else if (response.data.rewards) {
        setRewards(response.data.rewards);
      } else {
        // Create sample rewards if API returns different format
        setRewards([
          {
            id: 1,
            name: 'Gardens by the Bay Discount',
            description: '20% off admission tickets',
            points: 500,
            icon: '🌳'
          },
          {
            id: 2,
            name: 'Marina Bay Sands Tour',
            description: 'Free skypark observation deck access',
            points: 1000,
            icon: '🏙️'
          },
          {
            id: 3,
            name: 'Singapore Zoo Pass',
            description: '15% off zoo tickets',
            points: 750,
            icon: '🦁'
          },
          {
            id: 4,
            name: 'Sentosa Island Package',
            description: 'Discounted cable car + beach access',
            points: 1200,
            icon: '🏖️'
          }
        ]);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load rewards. Please try again later.');
      console.error('Error fetching rewards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (rewardId) => {
    try {
      await rewardsAPI.redeemReward(rewardId);
      setSuccessMessage('Reward redeemed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchRewards();
    } catch (err) {
      setError('Failed to redeem reward. Please try again.');
      console.error('Error redeeming reward:', err);
    }
  };

  if (loading) return <Loading message="Loading rewards..." />;

  return (
    <div className="rewards-page">
      <div className="card">
        <h1>🎁 Rewards Program</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Earn points by exploring Singapore and redeem them for exclusive rewards!
        </p>
        
        <div style={{ 
          background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
          padding: '2rem',
          borderRadius: 'var(--border-radius)',
          color: 'white',
          textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Your Points</h2>
          <p style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0 }}>1,250</p>
        </div>
      </div>

      {successMessage && (
        <div className="success">{successMessage}</div>
      )}

      {error && (
        <div className="error">{error}</div>
      )}

      <div className="card">
        <h2 style={{ marginBottom: '2rem' }}>Available Rewards</h2>
        
        {rewards.length === 0 ? (
          <p style={{ color: '#666' }}>No rewards available at the moment.</p>
        ) : (
          <div className="feature-grid">
            {rewards.map((reward) => (
              <div key={reward.id} className="card">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {reward.icon || '🎁'}
                </div>
                <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                  {reward.name}
                </h3>
                <p style={{ color: '#666', marginBottom: '1rem' }}>
                  {reward.description}
                </p>
                <p style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: 'var(--secondary-color)',
                  marginBottom: '1rem'
                }}>
                  {reward.points} points
                </p>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  onClick={() => handleRedeem(reward.id)}
                >
                  Redeem
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3>How to Earn Points</h3>
        <ul style={{ lineHeight: '2', color: '#666', paddingLeft: '1.5rem' }}>
          <li>Visit attractions and check in: <strong>+100 points</strong></li>
          <li>Book hotels through our platform: <strong>+200 points</strong></li>
          <li>Complete daily challenges: <strong>+50 points</strong></li>
          <li>Share your experience: <strong>+75 points</strong></li>
          <li>Refer a friend: <strong>+150 points</strong></li>
        </ul>
      </div>
    </div>
  );
};

export default Rewards;
