import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, MailIcon, PhoneIcon, LockIcon } from './Icons';

const Auth = ({ setUser, API_URL }) => {
  // Sign In Form State
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });
  const [signInError, setSignInError] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [signUpError, setSignUpError] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignInChange = (e) => {
    const { name, value } = e.target;
    setSignInData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setSignInError('');
    setSignInLoading(true);

    const { email, password } = signInData;

    if (!email || !password) {
      setSignInError('Please enter all fields.');
      setSignInLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      localStorage.setItem('userToken', data.token);
      localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email, phone: data.phone }));
      
      setUser(data);
      navigate('/dashboard');
    } catch (err) {
      setSignInError(err.message);
    } finally {
      setSignInLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setSignUpError('');
    setSignUpLoading(true);

    const { name, email, phone, password, confirmPassword } = signUpData;

    if (!name || !email || !phone || !password || !confirmPassword) {
      setSignUpError('Please fill in all fields.');
      setSignUpLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setSignUpError('Passwords do not match.');
      setSignUpLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      localStorage.setItem('userToken', data.token);
      localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email, phone: data.phone }));
      
      setUser(data);
      navigate('/dashboard');
    } catch (err) {
      setSignUpError(err.message);
    } finally {
      setSignUpLoading(false);
    }
  };

  return (
    <div className="section container max-w-1000 auth-page-container">
      <div className="glass-card auth-split-card">
        {/* Sign In Column */}
        <div className="auth-split-col">
          <h2 className="auth-column-title text-gradient">Customer Sign In</h2>
          <p className="auth-column-subtitle text-secondary">
            Sign in to manage your bookings and view your history.
          </p>

          {signInError && <div className="alert-box alert-danger">{signInError}</div>}

          <form onSubmit={handleSignInSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                <MailIcon size={14} /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={signInData.email}
                onChange={handleSignInChange}
                className="form-input"
                placeholder="customer@example.com"
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
                value={signInData.password}
                onChange={handleSignInChange}
                className="form-input"
                placeholder="Enter password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={signInLoading} style={{ marginTop: '16px' }}>
              {signInLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Vertical Divider */}
        <div className="auth-split-divider">
          <span className="divider-or">OR</span>
        </div>

        {/* Sign Up Column */}
        <div className="auth-split-col">
          <h2 className="auth-column-title text-gradient">Register Account</h2>
          <p className="auth-column-subtitle text-secondary">
            Create an account to book and track requests easily.
          </p>

          {signUpError && <div className="alert-box alert-danger">{signUpError}</div>}

          <form onSubmit={handleSignUpSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                <UserIcon size={14} /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={signUpData.name}
                onChange={handleSignUpChange}
                className="form-input"
                placeholder="e.g. Ramesh Reddy"
                required
              />
            </div>

            <div className="grid-2" style={{ gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: '0' }}>
                <label className="form-label">
                  <MailIcon size={14} /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={signUpData.email}
                  onChange={handleSignUpChange}
                  className="form-input"
                  placeholder="name@email.com"
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '0' }}>
                <label className="form-label">
                  <PhoneIcon size={14} /> Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={signUpData.phone}
                  onChange={handleSignUpChange}
                  className="form-input"
                  placeholder="e.g. 84988 70697"
                  required
                />
              </div>
            </div>

            <div className="grid-2" style={{ gap: '16px', marginTop: '16px' }}>
              <div className="form-group" style={{ marginBottom: '0' }}>
                <label className="form-label">
                  <LockIcon size={14} /> Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={signUpData.password}
                  onChange={handleSignUpChange}
                  className="form-input"
                  placeholder="Create password"
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '0' }}>
                <label className="form-label">
                  <LockIcon size={14} /> Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={signUpData.confirmPassword}
                  onChange={handleSignUpChange}
                  className="form-input"
                  placeholder="Re-type password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-accent w-full" disabled={signUpLoading} style={{ marginTop: '24px' }}>
              {signUpLoading ? 'Creating Account...' : 'Sign Up / Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
