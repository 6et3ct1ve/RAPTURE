import './ReviewCard.css';

function ReviewCard({ review }) {
  const averageRating = (
    (review.gameplay + review.graphics + review.story + 
     review.sound + review.replayability) / 5
  ).toFixed(1);

  return (
    <div className="review-card card">
      <div className="review-header">
        <h3>{review.username}</h3>
        <span className="rating">★ {averageRating}</span>
      </div>
      {review.game_title && <h4>{review.game_title}</h4>}
      <p className="review-text">{review.text}</p>
      <div className="review-ratings">
        <span>Gameplay: {review.gameplay}</span>
        <span>Graphics: {review.graphics}</span>
        <span>Story: {review.story}</span>
        <span>Sound: {review.sound}</span>
        <span>Replay: {review.replayability}</span>
      </div>
      {review.likes_count !== undefined && (
        <p className="likes">♥ {review.likes_count}</p>
      )}
    </div>
  );
}

export default ReviewCard;