import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CalendarIcon, UserIcon, PhoneIcon, ClipboardIcon, 
  CheckIcon, XIcon, LoaderIcon, StarIcon, MailIcon, MapPinIcon, ShieldCheckIcon,
  CameraIcon, LogOutIcon, LockIcon, EyeIcon, EyeOffIcon 
} from './Icons';
import { DEFAULT_AVATAR_SRC } from '../assets/defaultAvatarBase64';

const AdminDashboard = ({ admin, setAdmin, API_URL, logoutAdmin }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'bookings';
  const [activeTab, setActiveTab] = useState(
    ['bookings', 'reviews', 'messages', 'overview', 'profile'].includes(initialTab) ? initialTab : 'bookings'
  );
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

  // Admin Profile & Customization State
  const [adminProfileData, setAdminProfileData] = useState({
    name: admin?.name || 'Vinay (Poojitha Reddy)',
    username: admin?.username || 'admin',
    email: admin?.email || 'poojithareddyelectricals@gmail.com',
    phone: admin?.phone || '8498870697',
    avatar: admin?.avatar || '',
    role: admin?.role || 'Master Administrator',
  });
  const [pendingAvatar, setPendingAvatar] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  // Admin Password Change State
  const [adminPasswordData, setAdminPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  const navigate = useNavigate();

  // Sync activeTab with URL search params
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['bookings', 'reviews', 'messages', 'overview', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Sync profile data when admin prop updates
  useEffect(() => {
    if (admin) {
      setAdminProfileData((prev) => ({
        ...prev,
        name: admin.name || prev.name || 'Vinay (Poojitha Reddy)',
        username: admin.username || prev.username || 'admin',
        email: admin.email || prev.email || 'poojithareddyelectricals@gmail.com',
        phone: admin.phone || prev.phone || '8498870697',
        avatar: admin.avatar || prev.avatar || '',
        role: admin.role || prev.role || 'Master Administrator',
      }));
    }
  }, [admin]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Avatar Selection with 256x256 Off-Screen Canvas Compression
  const handleAvatarFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setProfileMsg({ type: 'danger', text: '⚠️ Selected image is too large (maximum 8MB).' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const img = new Image();
      img.onload = () => {
        // High quality 256x256 center-cropped avatar
        const canvas = document.createElement('canvas');
        const MAX_DIM = 256;
        canvas.width = MAX_DIM;
        canvas.height = MAX_DIM;
        const ctx = canvas.getContext('2d');
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, MAX_DIM, MAX_DIM);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setPendingAvatar(compressedBase64);
        setProfileMsg({ type: 'info', text: '📸 New photo selected! Click "Save Changes" below to update your profile photo.' });
      };
      img.src = uploadEvent.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Resilient multi-tier saving (LocalStorage + React State + Firestore + Backend REST API)
  const handleAdminProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });

    const finalAvatar = pendingAvatar !== null
      ? pendingAvatar
      : (adminProfileData.avatar || admin?.avatar || '');

    const updatedAdmin = {
      ...admin,
      name: adminProfileData.name.trim(),
      username: adminProfileData.username.trim(),
      email: adminProfileData.email.trim(),
      phone: adminProfileData.phone.trim(),
      avatar: finalAvatar,
      role: adminProfileData.role || admin?.role || 'Master Administrator',
    };

    // Update local state and clear pending avatar
    setAdminProfileData((prev) => ({ ...prev, avatar: finalAvatar }));
    setPendingAvatar(null);

    // 1. Immediately persist to LocalStorage and React State
    try {
      localStorage.setItem('admin', JSON.stringify(updatedAdmin));
      if (setAdmin) setAdmin(updatedAdmin);
    } catch (lsErr) {
      console.warn('LocalStorage save error:', lsErr);
    }

    // 2. Real-time Firestore sync
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      if (db) {
        const adminDocId = updatedAdmin._id || 'main_admin';
        await setDoc(doc(db, 'admins', String(adminDocId)), {
          ...updatedAdmin,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
    } catch (fbErr) {
      console.warn('Firestore admin sync notice:', fbErr);
    }

    // 3. Backend REST API update
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        const res = await fetch(`${API_URL}/api/auth/admin/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: updatedAdmin.name,
            username: updatedAdmin.username,
            email: updatedAdmin.email,
            phone: updatedAdmin.phone,
            avatar: finalAvatar,
          })
        });
        const data = await res.json();
        if (res.ok) {
          const freshAdmin = { ...updatedAdmin, ...data };
          localStorage.setItem('admin', JSON.stringify(freshAdmin));
          if (setAdmin) setAdmin(freshAdmin);
        }
      }
    } catch (apiErr) {
      console.warn('Backend REST API sync notice (saved locally & Firestore):', apiErr);
    }

    setProfileMsg({ type: 'success', text: '✅ Admin profile photo & credentials saved successfully!' });
    setProfileLoading(false);
  };

  // Password Change Handler
  const handleAdminPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMsg({ type: '', text: '' });

    if (adminPasswordData.newPassword !== adminPasswordData.confirmPassword) {
      setPasswordMsg({ type: 'danger', text: '❌ New password and confirmation do not match.' });
      setPasswordLoading(false);
      return;
    }

    if (adminPasswordData.newPassword.length < 6) {
      setPasswordMsg({ type: 'danger', text: '❌ New password must be at least 6 characters long.' });
      setPasswordLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/auth/admin/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: adminPasswordData.currentPassword,
          newPassword: adminPasswordData.newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to change admin password');
      }

      setPasswordMsg({ type: 'success', text: '✅ Admin password updated successfully!' });
      setAdminPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMsg({ type: 'danger', text: `❌ ${err.message}` });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Dedicated Admin Sign Out
  const handleProfileAdminSignOut = () => {
    if (window.confirm('Are you sure you want to sign out of the Admin Control Panel?')) {
      if (logoutAdmin) {
        logoutAdmin();
      } else {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        if (setAdmin) setAdmin(null);
      }
      navigate('/admin-login');
    }
  };

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
          <div className="dashboard-avatar-ring admin-avatar-ring">
            <img 
              src={admin?.avatar || DEFAULT_AVATAR_SRC} 
              alt="Admin Profile" 
              className="dashboard-avatar-img"
              onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR_SRC; }}
            />
            <span className="dashboard-avatar-badge admin-avatar-badge" title="Verified Administrator">
              <ShieldCheckIcon size={14} />
            </span>
          </div>
          <div>
            <span className="welcome-label text-purple">ADMIN CONTROL CENTRE</span>
            <h2>Welcome Back, {admin?.name || (admin?.username ? admin.username.toUpperCase() : 'Administrator')}!</h2>
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
          onClick={() => handleTabChange('bookings')} 
          className={`admin-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
        >
          Bookings ({bookings.length})
        </button>
        <button 
          onClick={() => handleTabChange('reviews')} 
          className={`admin-tab-btn ${activeTab === 'reviews' ? 'active text-purple-accent' : ''}`}
        >
          Review Moderation ({reviews.length})
        </button>
        <button 
          onClick={() => handleTabChange('messages')} 
          className={`admin-tab-btn ${activeTab === 'messages' ? 'active text-cyan-accent' : ''}`}
        >
          Inbox Messages ({messages.length})
        </button>
        <button 
          onClick={() => handleTabChange('overview')} 
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
        >
          System Overview
        </button>
        <button 
          onClick={() => handleTabChange('profile')} 
          className={`admin-tab-btn ${activeTab === 'profile' ? 'active text-purple-accent' : ''}`}
        >
          <UserIcon size={15} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} /> Admin Profile & Security
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
                          <p><strong>Phone:</strong> <a href={`tel:${booking.customerPhone}`} style={{ color: 'var(--accent-cyan)' }}>{booking.customerPhone}</a></p>
                          <p><strong>Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}</p>
                          {booking.address && (booking.address.street || booking.address.villageTown) && (
                            <p style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
                              <strong><MapPinIcon size={14} className="text-cyan" /> Service Location:</strong>{' '}
                              {[
                                booking.address.street,
                                booking.address.landmark ? `(Landmark: ${booking.address.landmark})` : '',
                                booking.address.villageTown,
                                booking.address.district,
                                booking.address.state,
                                booking.address.pincode
                              ].filter(Boolean).join(', ')}
                              {booking.address.coordinates?.lat && booking.address.coordinates?.lng ? (
                                <a 
                                  href={`https://www.google.com/maps?q=${booking.address.coordinates.lat},${booking.address.coordinates.lng}`}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ marginLeft: '10px', color: 'var(--accent-cyan)', fontWeight: '600', textDecoration: 'underline' }}
                                >
                                  🗺️ Navigate on Google Maps
                                </a>
                              ) : (
                                <a 
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([booking.address.street, booking.address.villageTown, booking.address.district, booking.address.pincode].filter(Boolean).join(', '))}`}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ marginLeft: '10px', color: 'var(--accent-cyan)', fontWeight: '600', textDecoration: 'underline' }}
                                >
                                  🗺️ Search on Google Maps
                                </a>
                              )}
                            </p>
                          )}
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

          {/* TAB 5: Admin Profile & Security */}
          {activeTab === 'profile' && (
            <div className="admin-panel-section animate-fade-in">
              <div className="panel-header" style={{ marginBottom: '24px' }}>
                <div>
                  <h3 className="sub-panel-title">
                    <UserIcon size={22} className="text-purple" /> Admin Profile & Security
                  </h3>
                  <p className="sub-panel-desc">
                    Customize your administrator identity, profile photo, contact details, and manage portal security credentials.
                  </p>
                </div>
              </div>

              {profileMsg.text && (
                <div className={`alert-box alert-${profileMsg.type}`} style={{ marginBottom: '24px' }}>
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleAdminProfileSubmit} className="profile-card-section">
                {/* Avatar / Profile Photo Section */}
                <div className="profile-avatar-card admin-profile-avatar-card">
                  <div className="profile-avatar-preview-wrap">
                    <div className="profile-avatar-ring admin-avatar-ring">
                      <img
                        src={pendingAvatar || adminProfileData.avatar || admin?.avatar || DEFAULT_AVATAR_SRC}
                        alt={adminProfileData.name || 'Admin Profile'}
                        className="profile-avatar-img"
                        onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR_SRC; }}
                      />
                      <button
                        type="button"
                        className="avatar-camera-btn admin-camera-btn"
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        title="Change Photo"
                        aria-label="Change Photo"
                      >
                        <CameraIcon size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="profile-avatar-actions">
                    <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', color: '#fff' }}>Administrator Photo</h4>
                    <p className="text-secondary" style={{ fontSize: '0.88rem', margin: '0 0 12px' }}>
                      {pendingAvatar 
                        ? '✨ New photo selected! Click "Save Changes" below to update.' 
                        : 'Personalize your administrator profile. Accepted formats: JPG, PNG, WebP (Max 8MB).'}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        style={{ display: 'none' }}
                        onChange={handleAvatarFileSelect}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      >
                        <CameraIcon size={15} /> Change Photo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Admin Credentials */}
                <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <h4 style={{ color: 'var(--accent-purple)', marginBottom: '16px', fontSize: '1.05rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheckIcon size={18} /> Administrative Credentials
                  </h4>
                  <div className="dashboard-form-grid">
                    <div className="form-group">
                      <label className="form-label">Admin Display Name *</label>
                      <input
                        type="text"
                        value={adminProfileData.name}
                        onChange={(e) => setAdminProfileData({ ...adminProfileData, name: e.target.value })}
                        className="form-input"
                        placeholder="e.g. Vinay (Poojitha Reddy)"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        Admin Username * <span className="profile-verified-badge admin-badge"><ShieldCheckIcon size={13} /> Login ID</span>
                      </label>
                      <input
                        type="text"
                        value={adminProfileData.username}
                        onChange={(e) => setAdminProfileData({ ...adminProfileData, username: e.target.value })}
                        className="form-input"
                        placeholder="e.g. admin"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Official Contact Email *</label>
                      <input
                        type="email"
                        value={adminProfileData.email}
                        onChange={(e) => setAdminProfileData({ ...adminProfileData, email: e.target.value })}
                        className="form-input"
                        placeholder="poojithareddyelectricals@gmail.com"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Primary Handyman Contact Phone *</label>
                      <input
                        type="tel"
                        value={adminProfileData.phone}
                        onChange={(e) => setAdminProfileData({ ...adminProfileData, phone: e.target.value })}
                        className="form-input"
                        placeholder="8498870697"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <button type="submit" className="btn btn-primary btn-lg-glow" disabled={profileLoading}>
                    {profileLoading ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </form>

              {/* Password Management */}
              <div style={{ marginTop: '36px', paddingTop: '28px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h4 style={{ color: 'var(--accent-purple)', marginBottom: '16px', fontSize: '1.05rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LockIcon size={18} /> Change Admin Password
                </h4>
                <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
                  Update the master administrator password for logging into the Admin Control Panel.
                </p>

                {passwordMsg.text && (
                  <div className={`alert-box alert-${passwordMsg.type}`} style={{ marginBottom: '20px' }}>
                    {passwordMsg.text}
                  </div>
                )}

                <form onSubmit={handleAdminPasswordChange} style={{ maxWidth: '600px' }}>
                  <div className="form-group">
                    <label className="form-label">Current Password *</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={adminPasswordData.currentPassword}
                        onChange={(e) => setAdminPasswordData({ ...adminPasswordData, currentPassword: e.target.value })}
                        className="form-input"
                        placeholder="Enter current password"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                        title={showCurrentPassword ? 'Hide password' : 'Show password'}
                        aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                      >
                        {showCurrentPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Password *</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={adminPasswordData.newPassword}
                        onChange={(e) => setAdminPasswordData({ ...adminPasswordData, newPassword: e.target.value })}
                        className="form-input"
                        placeholder="At least 6 characters"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        title={showNewPassword ? 'Hide password' : 'Show password'}
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password *</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={adminPasswordData.confirmPassword}
                        onChange={(e) => setAdminPasswordData({ ...adminPasswordData, confirmPassword: e.target.value })}
                        className="form-input"
                        placeholder="Re-enter new password"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <button type="submit" className="btn btn-secondary" disabled={passwordLoading}>
                      {passwordLoading ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Dedicated Sign Out of Admin Portal */}
              <div className="profile-signout-card admin-signout-card">
                <div className="profile-signout-info">
                  <h4 style={{ color: '#f87171' }}>
                    <LogOutIcon size={20} className="text-danger" /> Sign Out of Admin Portal
                  </h4>
                  <p>
                    Ending your admin session will require logging back in with your username and password. All system changes, booking records, and reviews are preserved.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleProfileAdminSignOut}
                  className="btn btn-outline-danger profile-signout-btn admin-signout-btn"
                >
                  <LogOutIcon size={16} /> Admin Out
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
