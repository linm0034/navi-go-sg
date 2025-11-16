import express from 'express';

const app = express();
app.use(express.json());

// Simple in-memory list of bookings
let bookings = [];

// Create a new booking. For demo purposes the request body
// is simply stored in memory.
app.post('/', (req, res) => {
  bookings.push(req.body);
  res.json({ success: true });
});

// Return all bookings for the current user. For now this just
// returns the full list for demonstration purposes.
app.get('/me', (_req, res) => {
  res.json(bookings);
});


// Delete a booking by index. This is a simple demo-only implementation
// that treats the URL parameter as the in-memory array index.
app.delete('/:id', (req, res) => {
  const index = parseInt(req.params.id, 10);
  if (Number.isNaN(index) || index < 0 || index >= bookings.length) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  bookings.splice(index, 1);
  res.json({ success: true });
});

const port = process.env.BOOKING_PORT || 4015;
app.listen(port, () => {
  console.log(`Booking API listening on ${port}`);
});