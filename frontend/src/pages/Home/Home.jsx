import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <div className="home-hero">
        <h1>[ RAPTURE ]</h1>
        <p>Reviews And Player Thoughts Unified Rating Engine</p>
      </div>

      <div className="home-links">
        <Link to="/games" className="home-link-card card">
          <h2>// GAMES</h2>
          <p>Browse and search for games</p>
        </Link>

        <Link to="/reviews" className="home-link-card card">
          <h2>// REVIEWS</h2>
          <p>Read community reviews</p>
        </Link>
      </div>
    </div>
  );
}

export default Home;