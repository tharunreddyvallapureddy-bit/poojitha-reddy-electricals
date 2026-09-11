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

  // Forgot Password State
  const [isForgot, setIsForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState({ type: '', text: '' });
  const [devForgotCode, setDevForgotCode] = useState('');

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
    setIsForgot(false);
    setSignInError('');
    setSignUpError('');
    setSignInData({ email: '', password: '' });
    setSignUpData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg({ type: '', text: '' });
    setDevForgotCode('');

    try {
      const res = await fetch(`${API_URL}/api/auth/user/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send reset code');
      }
      setForgotStep(2);
      setForgotMsg({ type: 'success', text: `📬 Verification code sent to ${forgotEmail}!` });
      if (data.devCode) {
        setDevForgotCode(data.devCode);
      }
    } catch (err) {
      setForgotMsg({ type: 'danger', text: err.message });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotReset = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg({ type: '', text: '' });

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotMsg({ type: 'danger', text: 'Passwords do not match.' });
      setForgotLoading(false);
      return;
    }

    if (forgotNewPassword.length < 6) {
      setForgotMsg({ type: 'danger', text: 'Password must be at least 6 characters.' });
      setForgotLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/user/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          code: forgotCode.trim(),
          newPassword: forgotNewPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }
      setForgotMsg({ type: 'success', text: '🎉 Password reset successfully! You can now log in.' });
      setTimeout(() => {
        setIsForgot(false);
        setIsLogin(true);
        setForgotStep(1);
        setForgotCode('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
      }, 2500);
    } catch (err) {
      setForgotMsg({ type: 'danger', text: err.message });
    } finally {
      setForgotLoading(false);
    }
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

        {isForgot ? (
          /* ================= FORGOT PASSWORD FORM ================= */
          <div className="auth-form-content animate-fade-in">
            <h2 className="minimal-auth-title">Reset Password</h2>
            <p className="minimal-auth-subtitle">
              {forgotStep === 1 
                ? 'Enter your registered email to receive a 6-digit code' 
                : 'Enter code & create a new password'}
            </p>

            {forgotMsg.text && (
              <div className={`alert-box alert-${forgotMsg.type}`} style={{ marginBottom: '16px' }}>
                {forgotMsg.text}
              </div>
            )}

            {devForgotCode && (
              <div className="alert-box alert-info" style={{ marginBottom: '16px', fontSize: '0.85rem' }}>
                💡 <strong>Verification Code:</strong> <code>{devForgotCode}</code>
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotRequest} className="minimal-form">
                <div className="form-group minimal-group">
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="form-input minimal-input"
                    placeholder="Registered Email Address"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-full minimal-submit-btn" disabled={forgotLoading}>
                  {forgotLoading ? 'Sending Code...' : 'Send Verification Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotReset} className="minimal-form">
                <div className="form-group minimal-group">
                  <input
                    type="text"
                    maxLength={6}
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ''))}
                    className="form-input minimal-input"
                    placeholder="6-Digit Verification Code"
                    style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.1rem' }}
                    required
                  />
                </div>

                <div className="form-group minimal-group">
                  <input
                    type="password"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className="form-input minimal-input"
                    placeholder="New Password (min 6 chars)"
                    required
                  />
                </div>

                <div className="form-group minimal-group">
                  <input
                    type="password"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    className="form-input minimal-input"
                    placeholder="Confirm New Password"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-full minimal-submit-btn" disabled={forgotLoading}>
                  {forgotLoading ? 'Resetting Password...' : 'Verify Code & Set Password'}
                </button>
              </form>
            )}

            <div className="minimal-auth-footer text-center" style={{ marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => { setIsForgot(false); setForgotStep(1); }}
                className="btn-link-toggle"
              >
                &larr; Back to Login
              </button>
            </div>
          </div>
        ) : isLogin ? (
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
                <a
                  href="#/auth"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsForgot(true);
                    setForgotMsg({ type: '', text: '' });
                    setForgotEmail(signInData.email || '');
                  }}
                >
                  Forgot password?
                </a>
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
