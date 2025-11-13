import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { rewardsAPI } from '../services/api';
import Loading from '../components/Loading';
import { useAuth } from '../contexts/AuthContext';

const FALLBACK_REWARDS = [
  {
    id: 1,
    name: 'Gardens by the Bay Discount',
    description: '20% off admission tickets',
    points: 500,
    icon: '🌳',
  },
  {
    id: 2,
    name: 'Marina Bay Sands SkyPark',
    description: 'Complimentary SkyPark observation deck access',
    points: 1000,
    icon: '🏙️',
  },
  {
    id: 3,
    name: 'Singapore Zoo Pass',
    description: '15% off all-day access to the Singapore Zoo',
    points: 750,
    icon: '🦁',
  },
  {
    id: 4,
    name: 'Sentosa Island Adventure',
    description: 'Discounted cable car and beach activity bundle',
    points: 1200,
    icon: '🏖️',
  },
];

const normalizeAvailableRewards = (data) => {
  if (!data) {
    return null;
  }

  const source = Array.isArray(data) ? data : Array.isArray(data.rewards) ? data.rewards : null;

  if (!Array.isArray(source) || source.length === 0) {
    return null;
  }

  return source.map((reward, index) => ({
    id: reward.id ?? reward.rewardId ?? index + 1,
    name: reward.name ?? reward.title ?? `Reward ${index + 1}`,
    description: reward.description ?? reward.details ?? 'Exclusive reward for NAVI-GO SG travellers.',
    points: Number(reward.points ?? reward.requiredPoints ?? reward.cost ?? 0) || 0,
    icon: reward.icon ?? reward.emoji ?? '🎁',
  }));
};

const normalizeUserRewardData = (data) => {
  if (!data) {
    return { points: 0, history: [] };
  }

  const points = Number(data.points ?? data.balance ?? 0) || 0;
  const historySource = Array.isArray(data.history)
    ? data.history
    : Array.isArray(data.redeemedRewards)
    ? data.redeemedRewards
    : [];

  const history = historySource.map((entry, index) => ({
    reward: entry.reward ?? entry.name ?? entry.title ?? `Reward ${index + 1}`,
    points: Number(entry.points ?? entry.cost ?? 0) || 0,
    redeemedAt: entry.redeemedAt ?? entry.date ?? entry.timestamp ?? new Date().toISOString(),
  }));

  return { points, history };
};

const formatDateTime = (value) => {
  if (!value) {
    return 'Recently redeemed';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-SG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const Rewards = () => {
  const { isAuthenticated, user } = useAuth();
  const [availableRewards, setAvailableRewards] = useState(FALLBACK_REWARDS);
  const [userRewards, setUserRewards] = useState({ points: 0, history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [redeemingId, setRedeemingId] = useState(null);

  const userPoints = useMemo(() => Number(userRewards.points) || 0, [userRewards.points]);
  const rewardHistory = userRewards.history || [];

  useEffect(() => {
    fetchRewards();
  }, []);

  useEffect(() => {
    if (!successMessage) {
      return () => {};
    }

    const timer = setTimeout(() => setSuccessMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const fetchRewards = async () => {
    try {
      setLoading(true);

      const [availableResponse, userResponse] = await Promise.all([
        rewardsAPI.getRewards().catch((err) => {
          console.warn('Unable to fetch available rewards', err);
          return null;
        }),
        rewardsAPI.getUserRewards().catch((err) => {
          console.warn('Unable to fetch user rewards', err);
          return null;
        }),
      ]);

      const normalizedRewards = normalizeAvailableRewards(availableResponse?.data);
      setAvailableRewards(normalizedRewards ?? FALLBACK_REWARDS);

      const normalizedUserRewards = normalizeUserRewardData(userResponse?.data);
      setUserRewards(normalizedUserRewards);

      if (!availableResponse && !userResponse) {
        setError('Rewards service is unavailable right now. Showing demo rewards instead.');
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching rewards:', err);
      setError('Failed to load rewards. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const simulateRewardRedemption = (reward) => {
    setSuccessMessage('Reward redeemed successfully! (demo)');
    setUserRewards((previous) => {
      const previousPoints = Number(previous.points) || 0;
      const updatedHistory = [
        {
          reward: reward.name,
          points: reward.points,
          redeemedAt: new Date().toISOString(),
        },
        ...(previous.history || []),
      ];

      return {
        points: Math.max(previousPoints - reward.points, 0),
        history: updatedHistory,
      };
    });

    setAvailableRewards((previous) =>
      previous.map((item) =>
        item.id === reward.id
          ? {
              ...item,
              redeemed: true,
            }
          : item
      )
    );
  };

  const handleRedeem = async (rewardId) => {
    const reward = availableRewards.find((item) => item.id === rewardId);
    if (!reward) {
      return;
    }

    if (!isAuthenticated) {
      setError('Please log in to redeem rewards.');
      return;
    }

    setError(null);
    setSuccessMessage('');
    setRedeemingId(rewardId);

    try {
      await rewardsAPI.redeemReward(rewardId);
      setSuccessMessage('Reward redeemed successfully!');
      await fetchRewards();
    } catch (err) {
      console.error('Error redeeming reward:', err);
      if (err.response?.status === 404) {
        simulateRewardRedemption(reward);
      } else {
        setError('Failed to redeem reward. Please try again.');
      }
    } finally {
      setRedeemingId(null);
    }
  };

  if (loading) return <Loading message="Loading rewards..." />;

  return (
    <div className="rewards-page">
      <div className="card">
        <div className="card-actions">
          <div>
            <h1>🎁 Rewards Program</h1>
            <p style={{ color: '#666', marginTop: '0.5rem' }}>
              Earn points by exploring Singapore and redeem them for exclusive experiences.
            </p>
          </div>
          <button className="btn btn-secondary" onClick={fetchRewards}>
            🔄 Refresh
          </button>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
            padding: '2rem',
            borderRadius: 'var(--border-radius)',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <h2 style={{ marginBottom: '0.5rem' }}>Available Points</h2>
          <p style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0 }}>
            {userPoints.toLocaleString('en-SG')}
          </p>
          <p style={{ marginTop: '0.75rem', opacity: 0.85 }}>
            {isAuthenticated
              ? `Logged in as ${user?.username || 'traveller'}`
              : 'Log in to start collecting personalised rewards'}
          </p>
        </div>

        {!isAuthenticated && (
          <div className="info-banner">
            <div>
              <strong>Want to redeem rewards?</strong>
              <p style={{ marginTop: '0.25rem', color: '#8a5a00' }}>
                Sign in to keep track of your points and unlock personalised benefits.
              </p>
            </div>
            <Link to="/login" className="btn btn-primary btn-sm">
              Login
            </Link>
          </div>
        )}
      </div>

      {successMessage && <div className="success">{successMessage}</div>}

      {error && <div className="error">{error}</div>}

      <div className="card">
        <div className="card-actions" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Available Rewards</h2>
          <span style={{ color: '#666' }}>
            {availableRewards.length} reward option{availableRewards.length === 1 ? '' : 's'}
          </span>
        </div>

        {availableRewards.length === 0 ? (
          <p style={{ color: '#666' }}>No rewards available at the moment.</p>
        ) : (
          <div className="feature-grid">
            {availableRewards.map((reward) => {
              const isRedeemed = reward.redeemed;
              return (
                <div key={reward.id} className="card reward-card">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{reward.icon || '🎁'}</div>
                  <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                    {reward.name}
                  </h3>
                  <p style={{ color: '#666', marginBottom: '1rem', minHeight: '3.5rem' }}>
                    {reward.description}
                  </p>
                  <p
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: 'var(--secondary-color)',
                      marginBottom: '1rem',
                    }}
                  >
                    {reward.points} points
                  </p>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => handleRedeem(reward.id)}
                    disabled={redeemingId === reward.id || isRedeemed}
                    title={!isAuthenticated ? 'Login to redeem rewards' : undefined}
                  >
                    {redeemingId === reward.id ? 'Redeeming...' : isRedeemed ? 'Redeemed' : 'Redeem'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Recent Activity</h3>
        {rewardHistory.length === 0 ? (
          <p style={{ color: '#666' }}>
            {isAuthenticated
              ? 'You have not redeemed any rewards yet.'
              : 'Sign in to view your reward history.'}
          </p>
        ) : (
          <div className="rewards-history">
            {rewardHistory.map((entry, index) => (
              <div key={`${entry.reward}-${index}`} className="history-item">
                <strong>{entry.reward}</strong>
                <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span className="badge badge-success">-{entry.points} pts</span>
                  <time>{formatDateTime(entry.redeemedAt)}</time>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3>How to Earn Points</h3>
        <ul style={{ lineHeight: '2', color: '#666', paddingLeft: '1.5rem' }}>
          <li>Visit attractions and check in: <strong>+100 points</strong></li>
          <li>Book hotels through NAVI-GO SG: <strong>+200 points</strong></li>
          <li>Complete daily challenges: <strong>+50 points</strong></li>
          <li>Share your experience and reviews: <strong>+75 points</strong></li>
          <li>Refer a friend to NAVI-GO SG: <strong>+150 points</strong></li>
        </ul>
      </div>
    </div>
  );
};

export default Rewards;
