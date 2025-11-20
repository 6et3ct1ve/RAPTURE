import { useState } from 'react';
import './ReviewForm.css';

function ReviewForm({ gameId, onSubmit }) {
  const [reviewText, setReviewText] = useState('');
  const [ratings, setRatings] = useState({
    gameplay: 3,
    graphics: 3,
    story: 3,
    sound: 3,
    replayability: 3
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ text: reviewText, ...ratings });
    setReviewText('');
    setRatings({
      gameplay: 3,
      graphics: 3,
      story: 3,
      sound: 3,
      replayability: 3
    });
  };

  return (
    <div className="review-form card">
      <h2>// WRITE REVIEW</h2>
      <form onSubmit={handleSubmit}>
        <div className="ratings">
          {Object.keys(ratings).map(key => (
            <div key={key} className="rating-input">
              <label>{key.toUpperCase()}</label>
              <input
                type="number"
                min="1"
                max="5"
                value={ratings[key]}
                onChange={(e) => setRatings({...ratings, [key]: parseInt(e.target.value)})}
              />
            </div>
          ))}
        </div>
        <textarea
          placeholder="Your review..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows="5"
          required
        />
        <button type="submit" className="btn-primary">SUBMIT REVIEW</button>
      </form>
    </div>
  );
}

export default ReviewForm;