import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../../components/Toast/ToastContext';
import './PasswordResetConfirm.css';

function PasswordResetConfirm() {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post(
        `http://localhost:8000/api/accounts/password-reset-confirm/${uidb64}/${token}/`,
        { new_password: newPassword }
      );
      showToast('Password reset successfully', 'success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to reset password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="password-reset-confirm-container">
      <div className="password-reset-confirm-card">
        <h2>Set New Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PasswordResetConfirm;