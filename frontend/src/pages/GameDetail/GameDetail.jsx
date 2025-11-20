import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import ReviewCard from '../../components/review/ReviewCard';
import ReviewForm from '../../components/review/ReviewForm';
import './GameDetail.css';

function GameDetail() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gameRes, reviewsRes] = await Promise.all([
          api.get(`/games/${id}/`),
          api.get(`/reviews/?game=${id}`)
        ]);
        setGame(gameRes.data);
        setReviews(reviewsRes.data.results || reviewsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmitReview = async (reviewData) => {
    try {
      await api.post('/reviews/', {
        game: id,
        ...reviewData
      });
      const res = await api.get(`/reviews/?game=${id}`);
      setReviews(res.data.results || res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to submit review. Make sure you are logged in.');
    }
  };

  if (!game) return <div>Loading...</div>;

  return (
    <div>
      <Link to="/" className="back-link">← Back to games</Link>
      
      <div className="game-header card">
        <h1>{game.title}</h1>
        <p className="game-meta">{game.developer} | {game.publisher}</p>
        {game.release_date && (
          <p className="game-meta">Released: {new Date(game.release_date).toLocaleDateString()}</p>
        )}
        <p className="game-description">{game.description}</p>
      </div>

      <ReviewForm gameId={id} onSubmit={handleSubmitReview} />

      <div className="reviews-section">
        <h2>// REVIEWS ({reviews.length})</h2>
        {reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}

export default GameDetail;