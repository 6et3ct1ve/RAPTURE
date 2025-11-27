import { Link } from 'react-router-dom';
import './ReviewCard.css';

function ReviewCard({ review }) {
  const averageRating = (
    (review.gameplay + review.graphics + review.story + 
     review.sound + review.replayability) / 5
  ).toFixed(1);

  return (
    <Link to={`/reviews/${review.id}`} className="review-card card">
      <div className="review-header">
        <h3>{review.username}</h3>
        <span className="rating">★ {averageRating}</span>
      </div>
      {review.game_title && <h4>{review.game_title}</h4>}
      <p className="review-text">{review.short_text}</p>
      <div className="review-footer">
        <span>♥ {review.likes_count || 0}</span>
      </div>
    </Link>
  );
}

export default ReviewCard;