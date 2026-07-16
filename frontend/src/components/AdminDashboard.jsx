import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, UserIcon, PhoneIcon, ClipboardIcon, 
  CheckIcon, XIcon, LoaderIcon, StarIcon, MailIcon 
} from './Icons';

const AdminDashboard = ({ admin, API_URL }) => {
  const [activeTab, setActiveTab] = useState('bookings'); // bookings, reviews, messages, overview
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [messages, setMessages] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    status: '',
    adminNotes: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!admin) {
      navigate('/admin-login');
      return;
    }
    fetchAllData();
  }, [admin]);

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch Bookings
      const bookingsRes = await fetch(`${API_URL}/api/bookings`, { headers });
      const bookingsData = await bookingsRes.json();
      if (!bookingsRes.ok) throw new Error(bookingsData.message || 'Failed to fetch bookings');
      setBookings(bookingsData);

      // Fetch Pending Reviews
      const reviewsRes = await fetch(`${API_URL}/api/reviews/pending`, { headers });
      const reviewsData = await reviewsRes.json();
      if (reviewsRes.ok) setReviews(reviewsData);

      // Fetch Messages
      const messagesRes = await fetch(`${API_URL}/api/messages`, { headers });
      const messagesData = await messagesRes.json();
      if (messagesRes.ok) setMessages(messagesData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdateSubmit = async (e, bookingId) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) throw new Error('Failed to update booking status.');

      // Update state local list
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: editFormData.status, adminNotes: editFormData.adminNotes } : b
        )
      );
      setEditingBookingId(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartEditing = (booking) => {
    setEditingBookingId(booking._id);
    setEditFormData({
      status: booking.status,
      adminNotes: booking.adminNotes || '',
    });
  };

  const handleApproveReview = async (reviewId) => {
    if (!window.confirm('Approve this review for the homepage?')) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/reviews/${reviewId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to approve review.');

      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete/reject this review?')) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete review.');

      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleMessageResolved = async (messageId, currentStatus) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/messages/${messageId}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isResolved: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to update message resolution.');

      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, isResolved: !currentStatus } : m))
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete message.');

      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to permanently delete this booking request?')) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete booking.');

      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics calculations
  const pendingBookingsCount = bookings.filter((b) => b.status === 'Pending').length;
  const acceptedBookingsCount = bookings.filter((b) => b.status === 'Accepted').length;
  const inProgressBookingsCount = bookings.filter((b) => b.status === 'In Progress').length;
  const completedBookingsCount = bookings.filter((b) => b.status === 'Completed').length;
  const pendingMessagesCount = messages.filter((m) => !m.isResolved).length;

  return (
    <div className="section container">
      {/* Admin Panel Header */}
      <div className="dashboard-header glass-card admin-dashboard-header" style={{ marginBottom: '32px' }}>
        <div className="header-user-info">
          <div className="avatar-circle admin-avatar-circle">
            <ClipboardIcon size={32} className="text-purple" />
          </div>
          <div>
            <span className="welcome-label text-purple">ADMIN CONTROL CENTRE</span>
            <h2>Poojitha Reddy Electricals Manager</h2>
          </div>
        </div>

        <div className="admin-quick-stats">
          <div className="admin-quick-stat-item">
            <span className="stat-label">Pending Bookings</span>
            <span className="stat-val text-warning">{pendingBookingsCount}</span>
          </div>
          <div className="admin-quick-stat-item">
            <span className="stat-label">Pending Inquiries</span>
            <span className="stat-val text-cyan">{pendingMessagesCount}</span>
          </div>
          <div className="admin-quick-stat-item">
            <span className="stat-label">Pending Reviews</span>
            <span className="stat-val text-purple">{reviews.length}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tab-nav">
        <button 
          onClick={() => setActiveTab('bookings')} 
          className={`admin-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
        >
          Bookings ({bookings.length})
        </button>
        <button 
          onClick={() => setActiveTab('reviews')} 
          className={`admin-tab-btn ${activeTab === 'reviews' ? 'active text-purple-accent' : ''}`}
        >
          Review Moderation ({reviews.length})
        </button>
        <button 
          onClick={() => setActiveTab('messages')} 
          className={`admin-tab-btn ${activeTab === 'messages' ? 'active text-cyan-accent' : ''}`}
        >
          Inbox Messages ({messages.length})
        </button>
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
        >
          System Overview
        </button>
      </div>

      {error && <div className="alert-box alert-danger">{error}</div>}

      {loading ? (
        <div className="loading-container text-center" style={{ padding: '60px 0' }}>
          <LoaderIcon size={40} className="text-purple" />
          <p className="text-secondary" style={{ marginTop: '16px' }}>Fetching system datasets...</p>
        </div>
      ) : (
        <div className="admin-tab-content glass-card">
          
          {/* TAB 1: Bookings Management */}
          {activeTab === 'bookings' && (
            <div className="admin-panel-section">
              <h3 className="panel-title">Manage Service Requests</h3>
              
              {bookings.length === 0 ? (
                <p className="text-muted text-center" style={{ padding: '40px 0' }}>No booking requests found.</p>
              ) : (
                <div className="admin-bookings-stack">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="admin-booking-card">
                      <div className="booking-card-head">
                        <div>
                          <span className="booking-card-code">{booking.bookingCode}</span>
                          <h4>{booking.serviceType}</h4>
                        </div>
                        <span className={`badge badge-${booking.status.toLowerCase().replace(' ', '')}`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="booking-card-body">
                        <div className="booking-body-meta">
                          <p><strong>Customer:</strong> {booking.customerName}</p>
                          <p><strong>Phone:</strong> {booking.customerPhone}</p>
                          <p><strong>Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}</p>
                        </div>
                        
                        <div className="booking-body-desc">
                          <p className="desc-label">Issue Details:</p>
                          <p className="desc-text">{booking.description || 'No description provided.'}</p>
                        </div>

                        {booking.adminNotes && editingBookingId !== booking._id && (
                          <div className="booking-body-notes">
                            <p className="notes-label">Handyman Notes:</p>
                            <p className="notes-text">{booking.adminNotes}</p>
                          </div>
                        )}

                        {editingBookingId === booking._id ? (
                          <form 
                            onSubmit={(e) => handleStatusUpdateSubmit(e, booking._id)} 
                            className="status-edit-form"
                          >
                            <div className="grid-2" style={{ gap: '16px' }}>
                              <div className="form-group" style={{ marginBottom: '0' }}>
                                <label className="form-label">Update Status</label>
                                <select
                                  value={editFormData.status}
                                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                  className="form-select"
                                  required
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Accepted">Accepted (Scheduled)</option>
                                  <option value="In Progress">In Progress (Worksite)</option>
                                  <option value="Completed">Completed (Done)</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </div>
                              <div className="form-group" style={{ marginBottom: '0' }}>
                                <label className="form-label">Handyman Notes (Visible to Customer)</label>
                                <input
                                  type="text"
                                  value={editFormData.adminNotes}
                                  onChange={(e) => setEditFormData({ ...editFormData, adminNotes: e.target.value })}
                                  className="form-input"
                                  placeholder="e.g. Scheduled for 10 AM; wiring completed..."
                                />
                              </div>
                            </div>
                            <div className="status-edit-actions">
                              <button type="submit" className="btn btn-primary btn-sm" disabled={actionLoading}>
                                Save Changes
                              </button>
                              <button 
                                type="button" 
                                onClick={() => setEditingBookingId(null)} 
                                className="btn btn-secondary btn-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="booking-card-actions">
                            <button onClick={() => handleStartEditing(booking)} className="btn btn-accent btn-sm">
                              Update Status & Notes
                            </button>
                            <button onClick={() => handleDeleteBooking(booking._id)} className="btn btn-secondary btn-sm text-danger-hover">
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Review Moderation */}
          {activeTab === 'reviews' && (
            <div className="admin-panel-section">
              <h3 className="panel-title">Pending Reviews Approval</h3>
              <p className="text-secondary" style={{ marginBottom: '24px', fontSize: '0.9rem' }}>
                Approve reviews to let them appear on the website homepage, or delete inappropriate feedback.
              </p>

              {reviews.length === 0 ? (
                <p className="text-muted text-center" style={{ padding: '40px 0' }}>No pending reviews for moderation.</p>
              ) : (
                <div className="admin-reviews-grid">
                  {reviews.map((review) => (
                    <div key={review._id} className="admin-review-card-item">
                      <div className="card-head">
                        <div>
                          <strong>{review.customerName}</strong>
                          <span className="date-span">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="stars-row">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                              key={star}
                              size={14}
                              fill={star <= review.rating ? 'currentColor' : 'none'}
                              className={star <= review.rating ? 'text-warning fill-warning' : 'text-muted'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="comment-text">"{review.comment}"</p>
                      
                      <div className="review-action-row">
                        <button 
                          onClick={() => handleApproveReview(review._id)} 
                          className="btn btn-primary btn-sm flex-row"
                          disabled={actionLoading}
                        >
                          <CheckIcon size={14} /> Approve
                        </button>
                        <button 
                          onClick={() => handleDeleteReview(review._id)} 
                          className="btn btn-secondary btn-sm text-danger"
                          disabled={actionLoading}
                        >
                          <XIcon size={14} /> Reject / Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Message Inbox */}
          {activeTab === 'messages' && (
            <div className="admin-panel-section">
              <h3 className="panel-title">Customer Inquiry Inbox</h3>
              
              {messages.length === 0 ? (
                <p className="text-muted text-center" style={{ padding: '40px 0' }}>No messages in inbox.</p>
              ) : (
                <div className="admin-messages-stack">
                  {messages.map((message) => (
                    <div key={message._id} className={`admin-msg-card ${message.isResolved ? 'resolved' : 'unresolved'}`}>
                      <div className="msg-card-head">
                        <div>
                          <span className="msg-subject">{message.subject}</span>
                          <div className="msg-meta-row">
                            <span><UserIcon size={12} /> {message.name}</span>
                            <span><MailIcon size={12} /> {message.email}</span>
                            <span><PhoneIcon size={12} /> {message.phone}</span>
                            <span className="date">{new Date(message.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className={`msg-status-badge ${message.isResolved ? 'resolved' : 'unresolved'}`}>
                          {message.isResolved ? 'Resolved' : 'Unresolved'}
                        </span>
                      </div>
                      
                      <p className="msg-text">{message.message}</p>
                      
                      <div className="msg-actions">
                        <button 
                          onClick={() => handleToggleMessageResolved(message._id, message.isResolved)}
                          className={`btn btn-sm ${message.isResolved ? 'btn-secondary' : 'btn-accent'}`}
                          disabled={actionLoading}
                        >
                          {message.isResolved ? 'Mark Unresolved' : 'Mark Resolved'}
                        </button>
                        <button 
                          onClick={() => handleDeleteMessage(message._id)}
                          className="btn btn-secondary btn-sm text-danger"
                          disabled={actionLoading}
                        >
                          Delete Message
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: System Overview Metrics */}
          {activeTab === 'overview' && (
            <div className="admin-panel-section">
              <h3 className="panel-title">System Metrics & Overview</h3>
              
              <div className="overview-metrics-grid">
                <div className="metric-box glass-card">
                  <span className="metric-title">Total Bookings</span>
                  <span className="metric-val">{bookings.length}</span>
                </div>
                <div className="metric-box glass-card">
                  <span className="metric-title">Completed Work</span>
                  <span className="metric-val text-success">{completedBookingsCount}</span>
                </div>
                <div className="metric-box glass-card">
                  <span className="metric-title">Active (Accepted & Progress)</span>
                  <span className="metric-val text-cyan">{acceptedBookingsCount + inProgressBookingsCount}</span>
                </div>
                <div className="metric-box glass-card">
                  <span className="metric-title">Pending Approvals</span>
                  <span className="metric-val text-warning">{pendingBookingsCount}</span>
                </div>
              </div>

              <div className="overview-summary-card glass-card" style={{ marginTop: '32px' }}>
                <h4>Handyman Operations Guide</h4>
                <p style={{ marginTop: '8px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                  Welcome Vinay! In this panel, you have full control over operations:
                </p>
                <ul className="operations-list" style={{ marginTop: '12px', paddingLeft: '20px', fontSize: '0.9rem' }}>
                  <li><strong>Update Statuses:</strong> When you start working on a job, mark it as "In Progress" and leave a note (e.g. "Arrived at location"). Customers tracking their code will see this update immediately.</li>
                  <li><strong>Moderate Reviews:</strong> Reviews submitted by customers do not appear on the website until you approve them under the "Review Moderation" tab.</li>
                  <li><strong>Inbox Management:</strong> Track contact messages, toggle resolved states to keep inbox clear, or delete old logs.</li>
                </ul>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
