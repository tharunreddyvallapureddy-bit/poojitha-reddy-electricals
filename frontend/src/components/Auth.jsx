import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserIcon, MailIcon, PhoneIcon, LockIcon } from './Icons';

const Auth = ({ setUser, API_URL }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { name, email, phone, password, confirmPassword } = formData;

    // Validation
    if (isLogin) {
      if (!email || !password) {
        setError('Please fill in all fields.');
        setLoading(false);
        return;
      }
    } else {
      if (!name || !email || !phone || !password || !confirmPassword) {
        setError('Please fill in all fields.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
    }

    const endpoint = isLogin ? '/api/auth/user/login' : '/api/auth/user/register';
    const bodyData = isLogin ? { email, password } : { name, email, phone, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed.');
      }

      // Store in localStorage
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email, phone: data.phone }));
      
      // Update App state
      setUser(data);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section container max-w-500 auth-page-container">
      <div className="glass-card auth-card">
        {/* Toggle Header Tabs */}
        <div className="auth-tabs">
          <button 
            type="button" 
            className={`auth-tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => !isLogin && handleToggle()}
          >
            Sign In
          </button>
          <button 
            type="button" 
            className={`auth-tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => isLogin && handleToggle()}
          >
            Sign Up
          </button>
        </div>

        <h2 className="auth-title text-center text-gradient" style={{ margin: '24px 0 8px 0' }}>
          {isLogin ? 'Welcome Back!' : 'Create Customer Account'}
        </h2>
        <p className="auth-subtitle text-center text-secondary" style={{ marginBottom: '32px' }}>
          {isLogin 
            ? 'Sign in to manage your bookings and view your history.' 
            : 'Register to book services quickly and track all requests in one place.'}
        </p>

        {error && <div className="alert-box alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">
                <UserIcon size={14} /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Ramesh Reddy"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              <MailIcon size={14} /> Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g. customer@example.com"
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">
                <PhoneIcon size={14} /> Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. 84988 70697"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              <LockIcon size={14} /> Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter secure password"
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">
                <LockIcon size={14} /> Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Re-enter password"
                required
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: '16px' }}>
            {loading 
              ? (isLogin ? 'Signing In...' : 'Registering...') 
              : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-footer text-center" style={{ marginTop: '24px' }}>
          {isLogin ? (
            <p className="text-secondary">
              Don't have a customer account?{' '}
              <button onClick={handleToggle} className="btn-link-action text-gradient">
                Sign Up
              </button>
            </p>
          ) : (
            <p className="text-secondary">
              Already have an account?{' '}
              <button onClick={handleToggle} className="btn-link-action text-gradient">
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
