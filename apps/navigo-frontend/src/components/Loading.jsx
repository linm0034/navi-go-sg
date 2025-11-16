import React from 'react';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="loading">
      <div className="spinner"></div>
      <p style={{ marginTop: '1rem' }}>{message}</p>
    </div>
  );
};

export default Loading;
