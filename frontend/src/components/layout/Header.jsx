import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        <h1>[ RAPTURE ]</h1>
      </Link>
      <nav className="nav">
        {isLoggedIn ? (
          <>
            <Link to="/profile">PROFILE</Link>
            <button onClick={handleLogout} className="btn-link">LOGOUT</button>
          </>
        ) : (
          <>
            <Link to="/login">LOGIN</Link>
            <Link to="/register">REGISTER</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;