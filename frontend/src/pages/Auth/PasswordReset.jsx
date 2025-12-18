import { useState } from 'react';
import axios from 'axios';
import { useToast } from '../../components/Toast/ToastContext';
import './PasswordReset.css';

function PasswordReset() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post('http://localhost:8000/api/accounts/password-reset/', { email });
      showToast('If email exists, reset link was sent', 'success');
      setEmail('');
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to send reset link', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="password-reset-container">
      <div className="password-reset-card">
        <h2>Reset Password</h2>
        <p>Enter your email to receive a password reset link</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PasswordReset;