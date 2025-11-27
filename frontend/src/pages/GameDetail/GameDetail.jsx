import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ReviewForm from '../../components/review/ReviewForm';
import './GameDetail.css';

function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const gameRes = await api.get(`/games/${id}/`);
        setGame(gameRes.data);
        
        const token = localStorage.getItem('access_token');
        if (token) {
          setIsLoggedIn(true);
          try {
            const reviewsRes = await api.get(`/reviews/`);
            const allReviews = reviewsRes.data.results || reviewsRes.data;
            
            const profileRes = await api.get('/accounts/profile/');
            const myReviews = allReviews.filter(r => r.user === profileRes.data.id);
            
            const hasReviewForThisGame = myReviews.some(review => {
              return String(review.game) === String(id) || review.game === parseInt(id);
            });
            
            setHasReviewed(hasReviewForThisGame);
            console.log('Has reviewed:', hasReviewForThisGame);
          } catch (err) {
            console.error('Review check error:', err);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id]);

const handleWriteReviewClick = () => {
  if (!isLoggedIn) {
    const currentPath = window.location.pathname;
    navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
    return;
  }
  
  if (hasReviewed) {
    alert('You have already reviewed this game.');
    return;
  }
  
  setShowForm(true);
};

const handleSubmitReview = async (reviewData) => {
  try {
    await api.post('/reviews/', {
      game: id,
      ...reviewData
    });
    alert('Review submitted successfully!');
    navigate('/reviews');
  } catch (err) {
    console.error(err);
    alert('Failed to submit review.');
  }
};

  if (!game) return <div>Loading...</div>;

  return (
    <div>
      <Link to="/games" className="back-link">← Back to games</Link>
      
      <div className="game-header card">
        <h1>{game.title}</h1>
        <p className="game-meta">{game.developer} | {game.publisher}</p>
        {game.release_date && (
          <p className="game-meta">Released: {new Date(game.release_date).toLocaleDateString()}</p>
        )}
        <p className="game-description">{game.description}</p>
      </div>

      {game.reviews_count > 0 && (
        <div className="game-stats card">
          <h2>// STATISTICS</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Reviews</span>
              <span className="stat-value">{game.reviews_count}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Average Rating</span>
              <span className="stat-value">★ {game.average_rating}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Gameplay</span>
              <span className="stat-value">★ {game.avg_gameplay}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Graphics</span>
              <span className="stat-value">★ {game.avg_graphics}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Story</span>
              <span className="stat-value">★ {game.avg_story}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Sound</span>
              <span className="stat-value">★ {game.avg_sound}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Replayability</span>
              <span className="stat-value">★ {game.avg_replayability}</span>
            </div>
          </div>
        </div>
      )}

      {!showForm ? (
        <button onClick={handleWriteReviewClick} className="btn-primary">
          WRITE REVIEW
        </button>
      ) : (
        <ReviewForm gameId={id} onSubmit={handleSubmitReview} />
      )}
    </div>
  );
}

export default GameDetail;