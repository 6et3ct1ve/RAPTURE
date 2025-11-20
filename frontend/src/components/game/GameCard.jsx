import { Link } from 'react-router-dom';
import './GameCard.css';

function GameCard({ game }) {
  return (
    <Link to={`/games/${game.id}`} className="game-card card">
      <h3>{game.title}</h3>
      <p className="developer">{game.developer}</p>
      {game.release_date && (
        <p className="release-date">{new Date(game.release_date).getFullYear()}</p>
      )}
    </Link>
  );
}

export default GameCard;