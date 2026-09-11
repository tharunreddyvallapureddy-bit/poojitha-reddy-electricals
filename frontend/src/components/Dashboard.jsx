import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  UserIcon, 
  PhoneIcon, 
  ClipboardIcon, 
  LoaderIcon, 
  LockIcon, 
  BellIcon, 
  MapPinIcon, 
  CheckIcon, 
  KeyIcon,
  MailIcon
} from './Icons';

const Dashboard = ({ user, setUser, API_URL }) => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Profile & Address State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: {
      street: user?.address?.street || '',
      landmark: user?.address?.landmark || '',
      villageTown: user?.address?.villageTown || '',
      district: user?.address?.district || '',
      state: user?.address?.state || 'Andhra Pradesh',
      pincode: user?.address?.pincode || '',
    }
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  // Forgot Password / OTP Reset inside Dashboard
  const [showOtpReset, setShowOtpReset] = useState(false);
  const [otpStep, setOtpStep] = useState(1); // 1 = request code, 2 = enter code & new pass
  const [otpCode, setOtpCode] = useState('');
  const [otpNewPassword, setOtpNewPassword] = useState('');
  const [otpConfirmPassword, setOtpConfirmPassword] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMsg, setOtpMsg] = useState({ type: '', text: '' });
  const [devOtpHint, setDevOtpHint] = useState('');

  // Notifications State
  const [notifications, setNotifications] = useState({
    bookingUpdates: user?.notifications?.bookingUpdates !== undefined ? user.notifications.bookingUpdates : true,
    handymanArrival: user?.notifications?.handymanArrival !== undefined ? user.notifications.handymanArrival : true,
    promotions: user?.notifications?.promotions !== undefined ? user.notifications.promotions : false,
  });
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifMsg, setNotifMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchMyBookings();
    fetchLatestProfile();
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

  const fetchLatestProfile = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) return;
      const res = await fetch(`${API_URL}/api/auth/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData({
          name: data.name || user?.name || '',
          phone: data.phone || user?.phone || '',
          email: data.email || user?.email || '',
          address: {
            street: data.address?.street || '',
            landmark: data.address?.landmark || '',
            villageTown: data.address?.villageTown || '',
            district: data.address?.district || '',
            state: data.address?.state || 'Andhra Pradesh',
            pincode: data.address?.pincode || '',
          }
        });
        if (data.notifications) {
          setNotifications(data.notifications);
        }
      }
    } catch (e) {
      console.warn('Could not fetch user profile details:', e);
    }
  };

  // Profile and Address update handler
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/auth/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileData.name,
          phone: profileData.phone,
          address: profileData.address,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update local storage and app state
      const updatedUser = {
        ...user,
        name: data.name,
        phone: data.phone,
        address: data.address,
        notifications: data.notifications || notifications,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (setUser) setUser(updatedUser);

      // Sync with Firestore
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        if (db && updatedUser._id) {
          await setDoc(doc(db, 'users', String(updatedUser._id)), {
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            address: updatedUser.address,
            notifications: updatedUser.notifications,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        }
      } catch (fbErr) {
        console.warn('Firestore user sync notice:', fbErr);
      }

      setProfileMsg({ type: 'success', text: '✅ Profile & Address details updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'danger', text: `❌ ${err.message}` });
    } finally {
      setProfileLoading(false);
    }
  };

  // Password change with current password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMsg({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ type: 'danger', text: '❌ New password and confirmation do not match.' });
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMsg({ type: 'danger', text: '❌ New password must be at least 6 characters.' });
      setPasswordLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API_URL}/api/auth/user/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      setPasswordMsg({ type: 'success', text: '✅ Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMsg({ type: 'danger', text: `❌ ${err.message}` });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Request OTP verification code for forgotten password
  const handleRequestOtp = async () => {
    setOtpLoading(true);
    setOtpMsg({ type: '', text: '' });
    setDevOtpHint('');

    try {
      const res = await fetch(`${API_URL}/api/auth/user/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to generate reset code');
      }

      setOtpStep(2);
      setOtpMsg({ type: 'success', text: `📬 Verification code sent to ${user.email}!` });
      if (data.devCode) {
        setDevOtpHint(data.devCode);
      }
    } catch (err) {
      setOtpMsg({ type: 'danger', text: `❌ ${err.message}` });
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP and reset password
  const handleVerifyOtpAndReset = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpMsg({ type: '', text: '' });

    if (otpNewPassword !== otpConfirmPassword) {
      setOtpMsg({ type: 'danger', text: '❌ Passwords do not match.' });
      setOtpLoading(false);
      return;
    }

    if (otpNewPassword.length < 6) {
      setOtpMsg({ type: 'danger', text: '❌ Password must be at least 6 characters.' });
      setOtpLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/user/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          code: otpCode.trim(),
          newPassword: otpNewPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setOtpMsg({ type: 'success', text: '🎉 Password has been reset successfully!' });
      setOtpCode('');
      setOtpNewPassword('');
      setOtpConfirmPassword('');
      setTimeout(() => {
        setShowOtpReset(false);
        setOtpStep(1);
      }, 2500);
    } catch (err) {
      setOtpMsg({ type: 'danger', text: `❌ ${err.message}` });
    } finally {
      setOtpLoading(false);
    }
  };

  // Save notification preferences
  const handleSaveNotifications = async (e) => {
    e.preventDefault();
    setNotifLoading(true);
    setNotifMsg({ type: '', text: '' });

    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API_URL}/api/auth/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          notifications
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update preferences');
      }

      const updatedUser = { ...user, notifications: data.notifications || notifications };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (setUser) setUser(updatedUser);

      // Sync with Firestore
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        if (db && updatedUser._id) {
          await setDoc(doc(db, 'users', String(updatedUser._id)), {
            notifications: updatedUser.notifications,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      } catch (fbErr) {
        console.warn('Firestore notification sync notice:', fbErr);
      }

      setNotifMsg({ type: 'success', text: '✅ Notification preferences saved successfully!' });
    } catch (err) {
      setNotifMsg({ type: 'danger', text: `❌ ${err.message}` });
    } finally {
      setNotifLoading(false);
    }
  };

  return (
    <div className="section container">
      {/* Dashboard Welcome Header */}
      <div className="dashboard-header glass-card" style={{ marginBottom: '24px' }}>
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

      {/* Customer Dashboard Navigation Tabs */}
      <div className="customer-tab-nav">
        <button
          className={`customer-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <ClipboardIcon size={18} /> My Service Requests
        </button>
        <button
          className={`customer-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <UserIcon size={18} /> Account Details & Address
        </button>
        <button
          className={`customer-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <LockIcon size={18} /> Security & Password
        </button>
        <button
          className={`customer-tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <BellIcon size={18} /> Notifications ({notifications.bookingUpdates ? 'Enabled' : 'Disabled'})
        </button>
      </div>

      {/* ================= TAB 1: MY BOOKINGS (EXACT LAYOUT FROM IMAGE) ================= */}
      {activeTab === 'bookings' && (
        <div className="dashboard-grid animate-fade-in">
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
      )}

      {/* ================= TAB 2: ACCOUNT DETAILS & ADDRESS ================= */}
      {activeTab === 'profile' && (
        <div className="glass-card animate-fade-in" style={{ padding: '36px' }}>
          <div className="panel-header">
            <div>
              <h3 className="sub-panel-title">
                <UserIcon size={22} className="text-cyan" /> Customer Details & Service Address
              </h3>
              <p className="sub-panel-desc">
                Keep your contact credentials and home/factory service address updated for speedy bookings.
              </p>
            </div>
          </div>

          {profileMsg.text && (
            <div className={`alert-box alert-${profileMsg.type}`} style={{ marginBottom: '24px' }}>
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="profile-card-section">
            {/* Personal Details */}
            <div>
              <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '16px', fontSize: '1rem', fontWeight: '700' }}>
                👤 Personal Credentials
              </h4>
              <div className="dashboard-form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group full-span">
                  <label className="form-label">Registered Email Address (Locked to account)</label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="form-input"
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                  />
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <h4 style={{ color: 'var(--accent-purple)', marginBottom: '16px', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPinIcon size={18} /> Service Address Section
              </h4>
              <div className="dashboard-form-grid">
                <div className="form-group full-span">
                  <label className="form-label">House / Door No & Street</label>
                  <input
                    type="text"
                    placeholder="e.g. 2-61, Main Street / Near Water Tank"
                    value={profileData.address.street}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      address: { ...profileData.address, street: e.target.value }
                    })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Landmark</label>
                  <input
                    type="text"
                    placeholder="e.g. Opposite Post Office"
                    value={profileData.address.landmark}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      address: { ...profileData.address, landmark: e.target.value }
                    })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Village / Town</label>
                  <input
                    type="text"
                    placeholder="e.g. Nallaballe / Muddanur"
                    value={profileData.address.villageTown}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      address: { ...profileData.address, villageTown: e.target.value }
                    })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">District</label>
                  <input
                    type="text"
                    placeholder="e.g. YSR Kadapa"
                    value={profileData.address.district}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      address: { ...profileData.address, district: e.target.value }
                    })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    value={profileData.address.state}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      address: { ...profileData.address, state: e.target.value }
                    })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    placeholder="e.g. 516380"
                    value={profileData.address.pincode}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      address: { ...profileData.address, pincode: e.target.value }
                    })}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div>
              <button type="submit" className="btn btn-primary btn-lg-glow" disabled={profileLoading}>
                {profileLoading ? 'Saving Details...' : 'Save Profile & Address Details'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TAB 3: SECURITY & PASSWORD ================= */}
      {activeTab === 'security' && (
        <div className="glass-card animate-fade-in" style={{ padding: '36px' }}>
          <div className="panel-header">
            <div>
              <h3 className="sub-panel-title">
                <LockIcon size={22} className="text-purple" /> Password & Account Security
              </h3>
              <p className="sub-panel-desc">
                Change your existing password or reset it via email verification code if forgotten.
              </p>
            </div>
          </div>

          {passwordMsg.text && (
            <div className={`alert-box alert-${passwordMsg.type}`} style={{ marginBottom: '24px' }}>
              {passwordMsg.text}
            </div>
          )}

          {/* Standard Change Password Form */}
          <form onSubmit={handleChangePassword} style={{ maxWidth: '600px' }}>
            <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '16px', fontSize: '1rem', fontWeight: '700' }}>
              🔑 Change Password (With Current Password)
            </h4>

            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="form-input"
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="dashboard-form-grid">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="form-input"
                  placeholder="Min 6 characters"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="form-input"
                  placeholder="Re-enter new password"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '12px' }}>
              <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                {passwordLoading ? 'Updating Password...' : 'Update Password'}
              </button>
              <button
                type="button"
                className="btn-link-toggle"
                style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)' }}
                onClick={() => {
                  setShowOtpReset(!showOtpReset);
                  setOtpMsg({ type: '', text: '' });
                }}
              >
                {showOtpReset ? 'Hide Forgot Password Section' : 'Forgot Current Password?'}
              </button>
            </div>
          </form>

          {/* Forgot Current Password: Email Verification Code Section */}
          {showOtpReset && (
            <div className="otp-box-highlight animate-fade-in" style={{ maxWidth: '600px' }}>
              <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyIcon size={20} /> Reset Password via Email Code
              </h4>
              <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
                We will send a 6-digit verification code directly to your registered email (<strong>{user?.email}</strong>) to safely create a new password.
              </p>

              {otpMsg.text && (
                <div className={`alert-box alert-${otpMsg.type}`} style={{ marginBottom: '20px' }}>
                  {otpMsg.text}
                </div>
              )}

              {devOtpHint && (
                <div className="alert-box alert-info" style={{ marginBottom: '20px', fontSize: '0.88rem' }}>
                  💡 <strong>Verification Code:</strong> <code>{devOtpHint}</code> (Sent to {user?.email})
                </div>
              )}

              {otpStep === 1 ? (
                <div>
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    className="btn btn-secondary"
                    disabled={otpLoading}
                  >
                    {otpLoading ? 'Sending Code...' : `📩 Send 6-Digit Code to ${user?.email}`}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVerifyOtpAndReset}>
                  <div className="form-group">
                    <label className="form-label">6-Digit Verification Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="form-input otp-digit-input"
                      placeholder="123456"
                      required
                    />
                  </div>

                  <div className="dashboard-form-grid">
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        value={otpNewPassword}
                        onChange={(e) => setOtpNewPassword(e.target.value)}
                        className="form-input"
                        placeholder="Min 6 characters"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        value={otpConfirmPassword}
                        onChange={(e) => setOtpConfirmPassword(e.target.value)}
                        className="form-input"
                        placeholder="Confirm password"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                    <button type="submit" className="btn btn-primary" disabled={otpLoading}>
                      {otpLoading ? 'Verifying...' : 'Verify Code & Set New Password'}
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      className="btn btn-secondary"
                      disabled={otpLoading}
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: NOTIFICATIONS (ENABLE / DISABLE) ================= */}
      {activeTab === 'notifications' && (
        <div className="glass-card animate-fade-in" style={{ padding: '36px' }}>
          <div className="panel-header">
            <div>
              <h3 className="sub-panel-title">
                <BellIcon size={22} className="text-cyan" /> Notification Alert Preferences
              </h3>
              <p className="sub-panel-desc">
                Enable or disable automated status alerts, arrival messages, and service reminders.
              </p>
            </div>
          </div>

          {notifMsg.text && (
            <div className={`alert-box alert-${notifMsg.type}`} style={{ marginBottom: '24px' }}>
              {notifMsg.text}
            </div>
          )}

          <form onSubmit={handleSaveNotifications}>
            <div className="notification-settings-list" style={{ marginBottom: '32px' }}>
              {/* Toggle 1 */}
              <div className="notification-toggle-card">
                <div className="toggle-info">
                  <h4>Booking Status Updates</h4>
                  <p>Receive immediate alerts when your service request moves to Accepted, In Progress, or Completed.</p>
                </div>
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={notifications.bookingUpdates}
                    onChange={(e) => setNotifications({ ...notifications, bookingUpdates: e.target.checked })}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>

              {/* Toggle 2 */}
              <div className="notification-toggle-card">
                <div className="toggle-info">
                  <h4>Handyman Arrival Alerts</h4>
                  <p>Get notified when technician V. Vinay Kumar Reddy is en route to your specified address.</p>
                </div>
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={notifications.handymanArrival}
                    onChange={(e) => setNotifications({ ...notifications, handymanArrival: e.target.checked })}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>

              {/* Toggle 3 */}
              <div className="notification-toggle-card">
                <div className="toggle-info">
                  <h4>Promotions & Seasonal Safety Tips</h4>
                  <p>Receive occasional updates regarding electrical safety precautions, monsoon checks, and seasonal tips.</p>
                </div>
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={notifications.promotions}
                    onChange={(e) => setNotifications({ ...notifications, promotions: e.target.checked })}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg-glow" disabled={notifLoading}>
              {notifLoading ? 'Saving Preferences...' : 'Save Notification Preferences'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
