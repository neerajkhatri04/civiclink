import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// SVG Icons as components
const MailIcon = () => (
  <svg style={{ width: '20px', height: '20px', color: '#A0AEC0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
  </svg>
);

const LockIcon = () => (
  <svg style={{ width: '20px', height: '20px', color: '#A0AEC0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
  </svg>
);

const UserIcon = () => (
  <svg style={{ width: '20px', height: '20px', color: '#A0AEC0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
  </svg>
);

const EyeIcon = () => (
  <svg style={{ width: '20px', height: '20px', color: '#A0AEC0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLineCap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
    <path strokeLineCap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
  </svg>
);

const EyeOffIcon = () => (
  <svg style={{ width: '20px', height: '20px', color: '#A0AEC0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLineCap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
  </svg>
);

const ArrowRightIcon = () => (
  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLineCap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
  </svg>
);

const LogInIcon = () => (
  <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLineCap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
  </svg>
);

// Logo Component
const Logo = ({ size = 'small' }) => {
  const isSmall = size === 'small';
  const circleClass = isSmall ? 'logo-circle-small' : 'logo-circle-large';
  const textClass = isSmall ? 'logo-text-small' : 'logo-text-large';
  const titleSize = isSmall ? '20px' : '36px';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
      <div className={`logo-circle ${circleClass}`}>
        <span className={textClass}>
          <span style={{ color: '#22D3EE' }}>C</span>
          <span style={{ color: '#60A5FA' }}>L</span>
        </span>
      </div>
      <span style={{ fontSize: titleSize, fontWeight: 'bold', color: 'white', textShadow: '0 0 10px rgba(255, 255, 255, 0.3)' }}>
        CivicLink
      </span>
    </div>
  );
};

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const result = await signup(formData.email, formData.password, formData.fullName);

    if (result.success) {
      navigate('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div style={{ margin: 0, padding: 0, width: '100%', minHeight: '100vh' }}>
      {/* Inline CSS matching landing page theme */}
      <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            margin: 0;
            padding: 0;
            width: 100%;
            overflow-x: hidden;
          }
          
          #root {
            margin: 0;
            padding: 0;
            width: 100%;
          }

          svg {
            margin-right: 5px;
          }
          
          .auth-page {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background-color: transparent;
            color: white;
            min-height: 100vh;
            overflow-x: hidden;
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
          }
          
          .gradient-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: -1;
            background: #0D0D0F;
          }
          
          .gradient-bg::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: 
                radial-gradient(ellipse 800px 600px at 30% 20%, rgba(138, 43, 226, 0.4) 0%, transparent 60%),
                radial-gradient(ellipse 600px 800px at 70% 80%, rgba(50, 205, 50, 0.3) 0%, transparent 60%),
                radial-gradient(ellipse 700px 500px at 20% 70%, rgba(0, 0, 139, 0.3) 0%, transparent 60%);
            filter: blur(60px);
            animation: float 20s ease-in-out infinite;
          }
          
          @keyframes float {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(30px, -30px) rotate(120deg); }
            66% { transform: translate(-20px, 20px) rotate(240deg); }
          }
          
          .auth-card {
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 48px;
            width: 100%;
            max-width: 520px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
          
          .auth-card::before {
            content: '';
            position: absolute;
            inset: -2px;
            padding: 2px;
            background: linear-gradient(45deg, #00ff88, #ff0080, #00ff88, #0080ff, #ff8000, #00ff88);
            background-size: 300% 300%;
            border-radius: 24px;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: exclude;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            animation: neonBorder 3s linear infinite;
            z-index: -1;
          }
          
          .auth-card::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent, rgba(0, 255, 136, 0.1), transparent, rgba(255, 0, 128, 0.1), transparent);
            background-size: 400% 400%;
            border-radius: 24px;
            animation: neonGlow 4s ease-in-out infinite;
            z-index: -1;
            filter: blur(20px);
          }
          
          @keyframes neonBorder {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          @keyframes neonGlow {
            0%, 100% { 
              background-position: 0% 50%;
              opacity: 0.5;
            }
            50% { 
              background-position: 100% 50%;
              opacity: 0.8;
            }
          }
          
          .auth-header {
            text-align: center;
            margin-bottom: 32px;
          }
          
          .auth-header h2 {
            font-size: 32px;
            font-weight: bold;
            color: white;
            margin: 24px 0 16px 0;
            line-height: 1.1;
          }
          
          .auth-header p {
            font-size: 16px;
            color: #A0AEC0;
            margin-bottom: 0;
          }
          
          .auth-form {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }
          
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          
          .form-group label {
            font-weight: 600;
            color: #E2E8F0;
            font-size: 14px;
          }
          
          .input-group {
            position: relative;
            display: flex;
            align-items: center;
          }
          
          .input-icon {
            position: absolute;
            left: 16px;
            z-index: 1;
          }
          
          .input-group input {
            width: 100%;
            padding: 16px 16px 16px 48px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: rgba(0, 0, 0, 0.3);
            color: white;
            backdrop-filter: blur(10px);
          }
          
          .input-group input.error {
            border-color: rgba(239, 68, 68, 0.5);
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
          }
          
          .input-group input::placeholder {
            color: #A0AEC0;
          }
          
          .input-group input:focus {
            outline: none;
            border-color: rgba(59, 130, 246, 0.5);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            background: rgba(0, 0, 0, 0.4);
          }
          
          .password-toggle {
            position: absolute;
            right: 16px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            border-radius: 6px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .password-toggle:hover {
            background: rgba(59, 130, 246, 0.1);
          }
          
          .error-message {
            color: #EF4444;
            font-size: 14px;
            margin-top: 4px;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          
          .btn-primary {
            background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
            box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
            border: none;
            padding: 16px 32px;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-top: 8px;
          }
          
          .btn-primary:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(139, 92, 246, 0.5);
          }
          
          .btn-primary:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
          }
          
          .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .auth-footer {
            text-align: center;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .auth-footer p {
            color: #A0AEC0;
            font-size: 16px;
          }
          
          .auth-link {
            color: #3B82F6;
            text-decoration: none;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            transition: all 0.3s ease;
          }
          
          .auth-link:hover {
            color: #60A5FA;
            transform: translateY(-1px);
          }
          
          .logo-circle {
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border: 1px solid rgba(34, 211, 238, 0.3);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 15px rgba(34, 211, 238, 0.2);
          }
          
          .logo-circle-small { width: 40px; height: 40px; }
          .logo-circle-large { width: 64px; height: 64px; }
          
          .logo-text-small { font-size: 14px; font-weight: 700; text-shadow: 0 0 10px currentColor; }
          .logo-text-large { font-size: 18px; font-weight: 700; text-shadow: 0 0 10px currentColor; }
          
          @media (max-width: 480px) {
            .auth-card {
              padding: 32px 24px;
              margin: 16px;
            }
            
            .auth-header h2 {
              font-size: 28px;
            }
          }
        `}
      </style>

      <div className="auth-page">
        <div className="gradient-bg"></div>
        <div className="auth-card">
          <div className="auth-header">
            <Logo size="large" />
            <h2>Create Account</h2>
            <p>Join CivicLink to report and track civic issues in your community</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <div className="input-group">
                <UserIcon />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={errors.fullName ? 'error' : ''}
                />
              </div>
              {errors.fullName && <div className="error-message">{errors.fullName}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-group">
                <MailIcon />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                />
              </div>
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-group">
                <LockIcon />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-group">
                <LockIcon />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRightIcon />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/signin" className="auth-link">
                <LogInIcon />
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
