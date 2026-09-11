import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MailIcon, UserIcon, PhoneIcon, LockIcon } from './Icons';

const Auth = ({ user, setUser, API_URL }) => {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const service = searchParams.get('service');
  const [isLogin, setIsLogin] = useState(true);
  
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

  // If already logged in, redirect to intended target or dashboard
  useEffect(() => {
    if (user) {
      if (redirect === 'book') {
        navigate(service ? `/book?service=${encodeURIComponent(service)}` : '/book', { replace: true });
      } else if (redirect === 'track') {
        const code = searchParams.get('code');
        navigate(code ? `/track?code=${encodeURIComponent(code)}` : '/track', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, redirect, service, searchParams, navigate]);

  const handleSignInChange = (e) => {
    const { name, value } = e.target;
    setSignInData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePostAuthNavigation = () => {
    if (redirect === 'book') {
      navigate(service ? `/book?service=${encodeURIComponent(service)}` : '/book');
    } else if (redirect === 'track') {
      const code = searchParams.get('code');
      navigate(code ? `/track?code=${encodeURIComponent(code)}` : '/track');
    } else {
      navigate('/dashboard');
    }
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setSignInError('');
    setSignInLoading(true);

    const { email, password } = signInData;

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
      handlePostAuthNavigation();
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
      handlePostAuthNavigation();
    } catch (err) {
      setSignUpError(err.message);
    } finally {
      setSignUpLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setSignInError('');
    setSignUpError('');
    setSignInData({ email: '', password: '' });
    setSignUpData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="section container max-w-500 auth-page-container">
      <div className="glass-card minimalist-auth-card">
        
        {redirect === 'book' && (
          <div className="alert-box alert-info" style={{ marginBottom: '24px', textAlign: 'center', fontWeight: '500' }}>
            ⚡ Please sign in or register an account to book your handyman service.
          </div>
        )}

        {redirect === 'track' && (
          <div className="alert-box alert-info" style={{ marginBottom: '24px', textAlign: 'center', fontWeight: '500' }}>
            🔍 Please sign in or register an account to track your booking status.
          </div>
        )}

        {isLogin ? (
          /* ================= LOGIN FORM ================= */
          <div className="auth-form-content">
            <h2 className="minimal-auth-title">Login</h2>
            <p className="minimal-auth-subtitle">Login to continue</p>

            {signInError && <div className="alert-box alert-danger">{signInError}</div>}

            <form onSubmit={handleSignInSubmit} className="minimal-form">
              <div className="form-group minimal-group">
                <input
                  type="email"
                  name="email"
                  value={signInData.email}
                  onChange={handleSignInChange}
                  className="form-input minimal-input"
                  placeholder="Email"
                  required
                />
              </div>

              <div className="form-group minimal-group">
                <input
                  type="password"
                  name="password"
                  value={signInData.password}
                  onChange={handleSignInChange}
                  className="form-input minimal-input"
                  placeholder="Password"
                  required
                />
              </div>

              <div className="forgot-password-link">
                <a href="#/auth" onClick={(e) => { e.preventDefault(); alert("Please contact V. Vinay Kumar Reddy at 84988 70697 to reset your credentials."); }}>Forgot password?</a>
              </div>

              <button type="submit" className="btn btn-primary w-full minimal-submit-btn" disabled={signInLoading}>
                {signInLoading ? 'Logging In...' : 'Login'}
              </button>

              <div className="remember-me-row">
                <label className="remember-label">
                  <input type="checkbox" className="remember-checkbox" defaultChecked />
                  <span>Remember me</span>
                </label>
              </div>
            </form>

            <div className="minimal-auth-footer text-center">
              Don't have an account?{' '}
              <button onClick={toggleAuthMode} className="btn-link-toggle">
                Sign up here
              </button>
            </div>
          </div>
        ) : (
          /* ================= SIGN UP FORM ================= */
          <div className="auth-form-content">
            <h2 className="minimal-auth-title">Sign up</h2>
            <p className="minimal-auth-subtitle">Sign up to continue</p>

            {signUpError && <div className="alert-box alert-danger">{signUpError}</div>}

            <form onSubmit={handleSignUpSubmit} className="minimal-form">
              <div className="form-group minimal-group">
                <input
                  type="text"
                  name="name"
                  value={signUpData.name}
                  onChange={handleSignUpChange}
                  className="form-input minimal-input"
                  placeholder="Name"
                  required
                />
              </div>

              <div className="form-group minimal-group">
                <input
                  type="email"
                  name="email"
                  value={signUpData.email}
                  onChange={handleSignUpChange}
                  className="form-input minimal-input"
                  placeholder="Email"
                  required
                />
              </div>

              <div className="form-group minimal-group">
                <input
                  type="tel"
                  name="phone"
                  value={signUpData.phone}
                  onChange={handleSignUpChange}
                  className="form-input minimal-input"
                  placeholder="Phone"
                  required
                />
              </div>

              <div className="form-group minimal-group">
                <input
                  type="password"
                  name="password"
                  value={signUpData.password}
                  onChange={handleSignUpChange}
                  className="form-input minimal-input"
                  placeholder="Password"
                  required
                />
              </div>

              <div className="form-group minimal-group">
                <input
                  type="password"
                  name="confirmPassword"
                  value={signUpData.confirmPassword}
                  onChange={handleSignUpChange}
                  className="form-input minimal-input"
                  placeholder="Confirm Password"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-full minimal-submit-btn" disabled={signUpLoading}>
                {signUpLoading ? 'Creating Account...' : 'Sign up'}
              </button>

              <div className="remember-me-row">
                <label className="remember-label">
                  <input type="checkbox" className="remember-checkbox" defaultChecked />
                  <span>Remember me</span>
                </label>
              </div>
            </form>

            <div className="minimal-auth-footer text-center">
              Already have an account?{' '}
              <button onClick={toggleAuthMode} className="btn-link-toggle">
                Sign in here
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Auth;
