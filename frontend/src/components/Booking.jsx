import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, Navigate } from 'react-router-dom';
import { CalendarIcon, UserIcon, PhoneIcon, ClipboardIcon, CheckIcon } from './Icons';

const Booking = ({ user, API_URL }) => {
  const [searchParams] = useSearchParams();
  const serviceParam = searchParams.get('service') || '';

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    serviceType: '',
    bookingDate: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successBooking, setSuccessBooking] = useState(null);

  // If not logged in, immediately redirect to sign in / sign up page
  if (!user) {
    const serviceQuery = serviceParam ? `&service=${encodeURIComponent(serviceParam)}` : '';
    return <Navigate to={`/auth?redirect=book${serviceQuery}`} replace />;
  }

  // Auto fill details from logged in user
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      customerName: user ? user.name : '',
      customerPhone: user ? user.phone : '',
      serviceType: serviceParam || prev.serviceType || 'All Electrical Works',
    }));
  }, [user, serviceParam]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.customerName || !formData.customerPhone || !formData.serviceType || !formData.bookingDate) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // If customer is logged in, attach JWT token
      const token = localStorage.getItem('userToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Booking submission failed. Please try again.');
      }

      setSuccessBooking(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (successBooking) {
    return (
      <div className="section container max-w-600">
        <div className="glass-card text-center success-receipt">
          <div className="success-icon-circle floating-element">
            <CheckIcon size={40} className="text-success" />
          </div>
          <h2 className="success-title text-gradient">Booking Confirmed!</h2>
          <p className="success-msg">Your service request has been registered successfully.</p>

          <div className="booking-code-box">
            <span className="code-label">YOUR BOOKING TRACKING CODE</span>
            <div className="code-value">{successBooking.bookingCode}</div>
            <p className="code-tip">Save this code to track your service progress anytime!</p>
          </div>

          <div className="receipt-details">
            <div className="receipt-row">
              <span>Service Type:</span>
              <strong>{successBooking.serviceType}</strong>
            </div>
            <div className="receipt-row">
              <span>Customer:</span>
              <strong>{successBooking.customerName}</strong>
            </div>
            <div className="receipt-row">
              <span>Booking Date:</span>
              <strong>{new Date(successBooking.bookingDate).toLocaleDateString()}</strong>
            </div>
            <div className="receipt-row">
              <span>Current Status:</span>
              <span className="badge badge-pending">{successBooking.status}</span>
            </div>
          </div>

          <div className="receipt-actions">
            <Link to={`/track?code=${successBooking.bookingCode}`} className="btn btn-primary">
              Track Status Now
            </Link>
            {user ? (
              <Link to="/dashboard" className="btn btn-secondary">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/" className="btn btn-secondary">
                Back to Home
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section container max-w-700">
      <div className="glass-card">
        <h2 className="section-title text-gradient" style={{ marginBottom: '10px' }}>Book a Handyman Service</h2>
        <p className="text-center text-secondary" style={{ marginBottom: '32px' }}>
          Schedule a visit by filling out the details below. We will confirm your request shortly.
        </p>

        {error && <div className="alert-box alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">
                <UserIcon size={14} /> Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. V. Vinay Kumar"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <PhoneIcon size={14} /> Contact Phone <span className="required">*</span>
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. 84988 70697"
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Service Category <span className="required">*</span></label>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="All Electrical Works">All Electrical Works</option>
                <option value="Industrial Works">Industrial Works</option>
                <option value="Plumbing Works">Plumbing Works</option>
                <option value="Welding Works">Welding Works</option>
                <option value="House Wiring">House Wiring</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <CalendarIcon size={14} /> Preferred Visit Date <span className="required">*</span>
              </label>
              <input
                type="date"
                name="bookingDate"
                value={formData.bookingDate}
                onChange={handleChange}
                className="form-input"
                required
                min={new Date().toISOString().split('T')[0]} // Block past dates
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description of Issue / Work details</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Describe what needs to be fixed or installed (e.g. Leak in bathroom tap, fitting 3 new lights in hall, industrial control panel wiring check...)"
            ></textarea>
          </div>

          <div className="booking-auth-tip">
            👤 <strong>Booking as:</strong> {user?.name} ({user?.phone}) — This request will be saved directly to your customer account dashboard!
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Submitting Request...' : 'Confirm & Request Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Booking;
