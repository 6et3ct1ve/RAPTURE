import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import GameCard from '../../components/game/GameCard';
import './Games.css';

function Games() {
  const [games, setGames] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const { data } = await api.get('/games/');
        setGames(data.results || data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGames();
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      const fetchGames = async () => {
        try {
          const { data } = await api.get('/games/');
          setGames(data.results || data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchGames();
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/search/games/?q=${query}`);
        setGames(data.results || []);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <div className="page-header">
        <h1>// GAMES</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search games..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          <Link to="/ai-recommend" className="btn-primary">
            AI RECOMMENDATIONS
          </Link>
        </div>
      </div>

      <div className="games-grid">
        {games.map(game => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      {games.length === 0 && (
        <p className="no-results">No games found</p>
      )}
    </div>
  );
}

export default Games;