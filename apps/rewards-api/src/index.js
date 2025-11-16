import express from 'express';

const app = express();
app.use(express.json());

// Simple in-memory reward storage
let rewards = {};

// Fetch the current user's rewards. In a real application
// this would authenticate the user from a token and load
// their rewards from a persistent store.
app.get('/api/rewards/me', (req, res) => {
  // Use a header to identify the user for this demo
  const user = req.header('x-user-email') || 'guest';
  if (!rewards[user]) {
    rewards[user] = { points: 0, history: [] };
  }
  res.json(rewards[user]);
});

const port = process.env.REWARDS_PORT || 4012;
app.listen(port, () => {
  console.log(`Rewards API listening on ${port}`);
});