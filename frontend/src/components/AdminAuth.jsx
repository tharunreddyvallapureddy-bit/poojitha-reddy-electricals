import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockIcon, UserIcon } from './Icons';

const AdminAuth = ({ setAdmin, API_URL }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.username || !formData.password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Admin authentication failed.');
      }

      // Store in localStorage
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('admin', JSON.stringify({ _id: data._id, username: data.username }));
      
      // Update App state
      setAdmin(data);
      
      // Redirect to admin dashboard
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section container max-w-500 auth-page-container">
      <div className="glass-card auth-card admin-auth-card">
        <div className="admin-lock-circle floating-element">
          <LockIcon size={36} className="text-purple" />
        </div>

        <h2 className="auth-title text-center text-gradient" style={{ margin: '16px 0 8px 0' }}>
          Admin Portal Login
        </h2>
        <p className="auth-subtitle text-center text-secondary" style={{ marginBottom: '32px' }}>
          This area is restricted to Poojitha Reddy Electricals authorized personnel.
        </p>

        {error && <div className="alert-box alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">
              <UserIcon size={14} /> Admin Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter admin username"
              required
            />
          </div>

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
              placeholder="Enter admin password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full btn-admin-submit" disabled={loading} style={{ marginTop: '16px' }}>
            {loading ? 'Logging in as Admin...' : 'Authenticate'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAuth;
