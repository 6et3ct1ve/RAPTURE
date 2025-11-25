import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './SearchBar.css';

function SearchBar() {
  const [query, setQuery] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setGames([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/search/games/?q=${query}`);
        setGames(data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search games..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />
      
      {loading && <div className="search-loading">Searching...</div>}
      
      {query.length >= 2 && games.length > 0 && (
        <div className="search-results">
          {games.map(game => (
            <Link 
              to={`/games/${game.id}`} 
              key={game.id} 
              className="search-result-item"
              onClick={() => setQuery('')}
            >
              <h4>{game.title}</h4>
              <p>{game.developer}</p>
            </Link>
          ))}
        </div>
      )}
      
      {query.length >= 2 && !loading && games.length === 0 && (
        <div className="search-no-results">No games found</div>
      )}
    </div>
  );
}

export default SearchBar;