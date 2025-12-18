import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './VerifyEmail.css';

function VerifyEmail() {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/accounts/verify-email/${uidb64}/${token}/`
        );
        
        if (response.data.access && response.data.refresh) {
          localStorage.setItem('access_token', response.data.access);
          localStorage.setItem('refresh_token', response.data.refresh);
        }
        
        setStatus('success');
        setMessage(response.data.message);
        
        const redirectTo = searchParams.get('redirect') || '/';
        
        setTimeout(() => {
          navigate(redirectTo, { replace: true });
          window.location.reload();
        }, 2000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Verification failed');
      }
    };

    verifyEmail();
  }, [uidb64, token, navigate, searchParams]);

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        {status === 'loading' && (
          <>
            <div className="spinner"></div>
            <h2>Verifying your email...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="success-icon">✓</div>
            <h2>Email Verified!</h2>
            <p>{message}</p>
            <p className="redirect-text">Logging you in...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="error-icon">✗</div>
            <h2>Verification Failed</h2>
            <p>{message}</p>
            <button onClick={() => navigate('/register')}>Back to Register</button>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;