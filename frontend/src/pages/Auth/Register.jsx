import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../components/Toast/ToastContext';
import './Auth.css';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/accounts/register/', { username, email, password });
      const { data } = await api.post('/accounts/login/', { username, password });
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      showToast('Registration successful', 'success');
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect);
    } catch (err) {
      showToast(err.response?.data?.error || 'Registration failed', 'error');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>[ RAPTURE REGISTER ]</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">REGISTER</button>
        </form>
        <p>Have account? <Link to={`/login${window.location.search}`}>Login here</Link></p>
      </div>
    </div>
  );
}

export default Register;