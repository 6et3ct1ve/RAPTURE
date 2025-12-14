import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1>[ 404 ]</h1>
        <p className="notfound-message">// PAGE NOT FOUND</p>
        <p className="notfound-description">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="btn-primary">
          RETURN HOME
        </Link>
      </div>
    </div>
  );
}

export default NotFound;