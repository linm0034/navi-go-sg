import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../services/api';
import Loading from '../components/Loading';

/**
 * Booking page
 *
 * Simple demo UI for the Booking API:
 * - Shows all current bookings from the booking-api service (via the gateway at /api/booking).
 * - Allows creating a sample booking so that you can verify end-to-end behaviour.
 * - Allows cancelling a booking by ID if the backend supports it.
 */
const Booking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    guestName: '',
    hotelName: '',
    checkInDate: '',
    nights: 1,
  });

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await bookingAPI.getBookings();
      // The demo booking-api returns the raw in-memory array
      setBookings(res.data || []);
    } catch (err) {
      console.error('Failed to load bookings', err);
      setError('Failed to load bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'nights' ? Number(value) || 1 : value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError('');
      const payload = {
        ...form,
        createdAt: new Date().toISOString(),
      };
      await bookingAPI.createBooking(payload);
      await loadBookings();
      setForm({
        guestName: '',
        hotelName: '',
        checkInDate: '',
        nights: 1,
      });
    } catch (err) {
      console.error('Failed to create booking', err);
      setError('Failed to create booking. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = async (indexOrId) => {
    // The demo booking-api stores bookings in memory without IDs, so we simply
    // call cancelBooking if an ID exists; otherwise we just reload the list.
    try {
      setLoading(true);
      setError('');
      if (indexOrId != null) {
        await bookingAPI.cancelBooking(indexOrId);
      }
      await loadBookings();
    } catch (err) {
      console.error('Failed to cancel booking', err);
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Booking</h1>
      <p style={{ maxWidth: '640px', color: '#666', marginBottom: '1.5rem' }}>
        This page demonstrates the Booking API (&quot;/api/booking&quot;) by allowing you to create
        simple demo bookings and view the current list stored in the booking service.
      </p>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
          gap: '2rem',
        }}
      >
        {/* Booking list */}
        <section>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Current bookings</h2>
          {loading && <Loading />}
          {!loading && bookings.length === 0 && (
            <p style={{ color: '#666' }}>No bookings yet. Create one using the form on the right.</p>
          )}
          {!loading && bookings.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bookings.map((b, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    padding: '0.9rem 1rem',
                    background: '#fafafa',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <strong>{b.hotelName || 'Hotel'}</strong>
                    {b.nights && (
                      <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>
                        {b.nights} night{b.nights > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '0.25rem' }}>
                    Guest: {b.guestName || 'N/A'}
                  </div>
                  {b.checkInDate && (
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                      Check-in: {new Date(b.checkInDate).toLocaleString()}
                    </div>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '0.5rem' }}
                    onClick={() => handleCancel(b.id ?? index)}
                  >
                    Cancel booking
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Booking form */}
        <section>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Create a demo booking</h2>
          <form onSubmit={handleCreate} className="card" style={{ padding: '1rem 1.25rem' }}>
            <div className="form-group">
              <label htmlFor="guestName">Guest name</label>
              <input
                id="guestName"
                name="guestName"
                type="text"
                value={form.guestName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="hotelName">Hotel name</label>
              <input
                id="hotelName"
                name="hotelName"
                type="text"
                value={form.hotelName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="checkInDate">Check-in date</label>
              <input
                id="checkInDate"
                name="checkInDate"
                type="datetime-local"
                value={form.checkInDate}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="nights">Nights</label>
              <input
                id="nights"
                name="nights"
                type="number"
                min="1"
                value={form.nights}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Creating...' : 'Create booking'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Booking;
