import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchIcon, CalendarIcon, ClipboardIcon, ToolIcon } from './Icons';

const Tracker = ({ API_URL }) => {
  const [searchParams] = useSearchParams();
  const codeParam = searchParams.get('code') || '';

  const [bookingCode, setBookingCode] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If redirected with code parameter, trigger search automatically
  useEffect(() => {
    if (codeParam) {
      setBookingCode(codeParam);
      trackBooking(codeParam);
    }
  }, [codeParam]);

  const trackBooking = async (codeToSearch) => {
    const code = codeToSearch || bookingCode;
    if (!code) return;

    setError('');
    setBooking(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/bookings/track/${code.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Reference code not found.');
      }

      setBooking(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    trackBooking();
  };

  // Helper to determine active steps in progress line
  const getStatusStepIndex = (status) => {
    const steps = ['Pending', 'Accepted', 'In Progress', 'Completed'];
    return steps.indexOf(status);
  };

  const currentStepIdx = booking ? getStatusStepIndex(booking.status) : -1;

  return (
    <div className="section container max-w-700">
      <div className="glass-card">
        <h2 className="section-title text-gradient" style={{ marginBottom: '10px' }}>Track Your Booking</h2>
        <p className="text-center text-secondary" style={{ marginBottom: '32px' }}>
          Enter your unique booking reference code (e.g. PRE-XXXXXX) to monitor the status of your request in real-time.
        </p>

        <form onSubmit={handleSearchSubmit} className="tracker-search-form">
          <div className="search-input-wrapper">
            <SearchIcon size={20} className="search-input-icon" />
            <input
              type="text"
              value={bookingCode}
              onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
              placeholder="Enter Reference Code (e.g. PRE-W19A82)"
              className="form-input search-input-field"
              required
            />
            <button type="submit" className="btn btn-primary search-btn" disabled={loading}>
              {loading ? 'Searching...' : 'Track'}
            </button>
          </div>
        </form>

        {error && <div className="alert-box alert-danger text-center">{error}</div>}

        {booking && (
          <div className="tracker-results animate-fade-in" style={{ marginTop: '40px' }}>
            {/* Status Progress Line */}
            {booking.status !== 'Cancelled' ? (
              <div className="status-progress-bar">
                <div className="progress-line">
                  <div 
                    className="progress-line-fill" 
                    style={{ width: `${(Math.max(0, currentStepIdx) / 3) * 100}%` }}
                  ></div>
                </div>
                <div className="progress-steps">
                  <div className={`step-node ${currentStepIdx >= 0 ? 'active' : ''}`}>
                    <div className="step-circle">1</div>
                    <div className="step-label">Pending</div>
                  </div>
                  <div className={`step-node ${currentStepIdx >= 1 ? 'active' : ''}`}>
                    <div className="step-circle">2</div>
                    <div className="step-label">Accepted</div>
                  </div>
                  <div className={`step-node ${currentStepIdx >= 2 ? 'active' : ''}`}>
                    <div className="step-circle">3</div>
                    <div className="step-label">In Progress</div>
                  </div>
                  <div className={`step-node ${currentStepIdx >= 3 ? 'active' : ''}`}>
                    <div className="step-circle">4</div>
                    <div className="step-label">Completed</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="alert-box alert-danger text-center" style={{ fontSize: '1.1rem' }}>
                ❌ This booking request has been <strong>Cancelled</strong>.
              </div>
            )}

            {/* Booking Details Card */}
            <div className="booking-details-card" style={{ marginTop: '40px' }}>
              <div className="details-header">
                <div>
                  <span className="details-ref">Reference Code: {booking.bookingCode}</span>
                  <h3>{booking.serviceType}</h3>
                </div>
                <span className={`badge badge-${booking.status.toLowerCase().replace(' ', '')}`}>
                  {booking.status}
                </span>
              </div>

              <div className="details-grid">
                <div className="details-item">
                  <span className="label">Customer Name</span>
                  <span className="val">{booking.customerName}</span>
                </div>
                <div className="details-item">
                  <span className="label">Preferred Visit Date</span>
                  <span className="val">
                    <CalendarIcon size={14} /> {new Date(booking.bookingDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="details-item full-width">
                  <span className="label">Work Description</span>
                  <p className="val-desc">{booking.description || 'No description provided.'}</p>
                </div>
                {booking.adminNotes && (
                  <div className="details-item full-width admin-notes-box">
                    <span className="label text-purple">💡 Handyman Update / Admin Notes</span>
                    <p className="val-notes">{booking.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tracker;
