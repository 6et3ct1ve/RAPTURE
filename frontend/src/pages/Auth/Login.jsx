import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../components/Toast/ToastContext';
import './Auth.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/accounts/login/', { username, password });
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      showToast('Login successful', 'success');
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect);
    } catch (err) {
      showToast('Invalid credentials', 'error');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>[ RAPTURE LOGIN ]</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">LOGIN</button>
        </form>
        <p>No account? <Link to={`/register${window.location.search}`}>Register here</Link></p>
      </div>
    </div>
  );
}

export default Login;