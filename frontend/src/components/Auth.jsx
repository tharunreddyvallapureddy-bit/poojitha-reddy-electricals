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

  const scrollToCol = (targetClass) => {
    const el = document.querySelector(targetClass);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="section container auth-page-container">
      <div className="auth-cards-container">
        
        {/* Card 1: Login */}
        <div className="auth-card-individual glass-card login-card-col">
          <h2 className="auth-card-title text-gradient">Login</h2>
          <p className="auth-card-subtitle text-secondary">
            Sign in to manage your bookings and view history.
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
                placeholder="Enter your email"
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
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={signInLoading} style={{ marginTop: '16px' }}>
              {signInLoading ? 'Signing In...' : 'Login'}
            </button>
          </form>

          <div className="auth-card-footer text-center">
            Don't have an account?{' '}
            <button onClick={() => scrollToCol('.signup-card-col')} className="btn-link-action text-gradient">
              Signup
            </button>
          </div>
        </div>

        {/* Card 2: Signup */}
        <div className="auth-card-individual glass-card signup-card-col">
          <h2 className="auth-card-title text-gradient">Signup</h2>
          <p className="auth-card-subtitle text-secondary">
            Create an account to book handyman services.
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
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <MailIcon size={14} /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={signUpData.email}
                onChange={handleSignUpChange}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <PhoneIcon size={14} /> Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={signUpData.phone}
                onChange={handleSignUpChange}
                className="form-input"
                placeholder="Enter your phone"
                required
              />
            </div>

            <div className="grid-2" style={{ gap: '16px' }}>
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
                  placeholder="Create a password"
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
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-accent w-full" disabled={signUpLoading} style={{ marginTop: '24px' }}>
              {signUpLoading ? 'Registering...' : 'Signup'}
            </button>
          </form>

          <div className="auth-card-footer text-center">
            Already have an account?{' '}
            <button onClick={() => scrollToCol('.login-card-col')} className="btn-link-action text-gradient">
              Login
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Auth;
