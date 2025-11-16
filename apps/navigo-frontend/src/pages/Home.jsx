import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      icon: '🏨',
      title: 'Hotel Rankings',
      description: 'Discover the best hotels in Singapore with our comprehensive ranking system.',
      link: '/hotels'
    },
    {
      icon: '🌤️',
      title: 'Weather Forecast',
      description: 'Check real-time weather conditions and plan your activities accordingly.',
      link: '/weather'
    },
    {
      icon: '🗺️',
      title: 'Crowd Heatmap',
      description: 'View real-time crowd density at MRT stations and tourist hotspots.',
      link: '/heatmap'
    },
    {
      icon: '💬',
      title: 'AI Chatbot',
      description: 'Get instant answers to your questions about Singapore tourism.',
      link: '/chatbot'
    },
    {
      icon: '🎁',
      title: 'Rewards',
      description: 'Earn and redeem rewards for exploring Singapore attractions.',
      link: '/rewards'
    },
    {
      icon: '📍',
      title: 'Hotel Map',
      description: 'Interactive map showing all hotel locations across Singapore.',
      link: '/map'
    }
  ];

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Welcome to NAVI-GO SG 🇸🇬</h1>
        <p>
          Your ultimate companion for exploring Singapore. Discover hotels, check weather,
          navigate crowds, and get personalized recommendations.
        </p>
      </section>

      <div className="feature-grid">
        {features.map((feature, index) => (
          <Link key={index} to={feature.link} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </Link>
        ))}
      </div>

      <section className="card" style={{ marginTop: '3rem' }}>
        <h2>About NAVI-GO SG</h2>
        <p style={{ lineHeight: '1.8', color: '#666' }}>
          NAVI-GO SG is a comprehensive tourist guide application designed to help visitors
          and locals explore Singapore with ease. Our platform integrates multiple services
          including hotel recommendations, real-time weather updates, crowd monitoring,
          AI-powered assistance, and a rewards program to enhance your Singapore experience.
        </p>
      </section>
    </div>
  );
};

export default Home;
