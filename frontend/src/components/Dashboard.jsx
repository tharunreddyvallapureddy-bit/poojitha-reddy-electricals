import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarIcon, UserIcon, PhoneIcon, ClipboardIcon, LoaderIcon } from './Icons';

const Dashboard = ({ user, API_URL }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchMyBookings();
  }, [user]);

  const fetchMyBookings = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/bookings/mybookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setBookings(data);
      } else {
        throw new Error(data.message || 'Failed to load bookings');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section container">
      {/* Dashboard Welcome Header */}
      <div className="dashboard-header glass-card" style={{ marginBottom: '32px' }}>
        <div className="header-user-info">
          <div className="avatar-circle">
            <UserIcon size={32} className="text-cyan" />
          </div>
          <div>
            <span className="welcome-label">CUSTOMER PORTAL</span>
            <h2>Welcome Back, {user?.name}!</h2>
          </div>
        </div>
        
        <div className="profile-details-row">
          <div className="profile-detail-item">
            <span className="label">Registered Email:</span>
            <span className="val">{user?.email}</span>
          </div>
          <div className="profile-detail-item">
            <span className="label">Registered Contact:</span>
            <span className="val">{user?.phone}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Bookings History Panel */}
        <div className="dashboard-main glass-card">
          <div className="panel-header">
            <h3>My Service Requests</h3>
            <span className="count-badge">{bookings.length} Bookings</span>
          </div>

          {error && <div className="alert-box alert-danger">{error}</div>}

          {loading ? (
            <div className="loading-container text-center" style={{ padding: '40px 0' }}>
              <LoaderIcon size={32} className="text-cyan" />
              <p className="text-secondary" style={{ marginTop: '12px' }}>Loading booking records...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="empty-panel text-center" style={{ padding: '60px 20px' }}>
              <ClipboardIcon size={48} className="text-muted" style={{ marginBottom: '16px' }} />
              <h4>No service requests registered yet.</h4>
              <p className="text-secondary" style={{ marginBottom: '24px', fontSize: '0.95rem' }}>
                Need electrical wiring, plumbing, welding or repair work? Schedule a visit now.
              </p>
              <Link to="/book" className="btn btn-primary">
                Book a Service
              </Link>
            </div>
          ) : (
            <div className="bookings-table-wrapper">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Ref Code</th>
                    <th>Service Category</th>
                    <th>Scheduled Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td className="code-td">
                        <Link to={`/track?code=${booking.bookingCode}`} className="table-code-link" title="Click to track">
                          {booking.bookingCode}
                        </Link>
                      </td>
                      <td className="service-td">{booking.serviceType}</td>
                      <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge badge-${booking.status.toLowerCase().replace(' ', '')}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/track?code=${booking.bookingCode}`} className="btn btn-accent btn-xs-track">
                          Track Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions Side Panel */}
        <div className="dashboard-side glass-card">
          <h3>Quick Controls</h3>
          <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
            Book new handyman works instantly with your saved contact info, or check reference codes.
          </p>

          <div className="side-action-buttons">
            <Link to="/book" className="btn btn-primary w-full side-action-btn">
              ⚡ Book New Service
            </Link>
            <Link to="/track" className="btn btn-secondary w-full side-action-btn">
              🔍 Track by Code
            </Link>
          </div>

          <div className="handyman-card-side">
            <h4>Need Immediate Help?</h4>
            <p>For urgent emergencies, call our handyman Vinay directly:</p>
            <a href="tel:8498870697" className="handyman-phone-val">
              📞 84988 70697
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
