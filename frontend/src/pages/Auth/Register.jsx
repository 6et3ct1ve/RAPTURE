import { useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../../components/Toast/ToastContext';
import './Auth.css';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const redirectPath = searchParams.get('redirect') || location.state?.from?.pathname || '/';
      
      await axios.post('http://localhost:8000/api/accounts/register/', {
        ...formData,
        redirect_path: redirectPath
      });
      
      setEmailSent(true);
      showToast('Check your email to verify your account', 'success');
    } catch (error) {
      showToast(
        error.response?.data?.username?.[0] || 
        error.response?.data?.email?.[0] || 
        'Registration failed',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const redirectPath = searchParams.get('redirect') || location.state?.from?.pathname || '/';
      
      await axios.post('http://localhost:8000/api/accounts/resend-verification/', {
        email: formData.email,
        redirect_path: redirectPath
      });
      
      showToast('Verification email resent!', 'success');
    } catch (error) {
      showToast('Failed to resend email', 'error');
    } finally {
      setIsResending(false);
    }
  };

  if (emailSent) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h2>✓ Check Your Email</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
            We've sent a verification link to <strong>{formData.email}</strong>
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Click the link in the email to verify your account and get started.
          </p>
          <button 
            onClick={handleResend}
            disabled={isResending}
            className="btn-primary"
            style={{ 
              width: '100%', 
              padding: '12px',
              marginBottom: '10px'
            }}
          >
            {isResending ? 'Resending...' : 'Resend Email'}
          </button>
          <button 
            onClick={() => setEmailSent(false)}
            style={{ 
              width: '100%', 
              padding: '12px', 
              background: 'var(--border)', 
              color: 'var(--text-primary)'
            }}
          >
            Back to Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <a href={`/login${location.search}`}>Login</a>
        </p>
      </div>
    </div>
  );
}

export default Register;