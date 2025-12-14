import { useState } from 'react';
import { useToast } from '../Toast/ToastContext';
import './ReviewForm.css';

function ReviewForm({ gameId, onSubmit }) {
  const { showToast } = useToast();
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
    
    const ratingValues = Object.values(ratings);
    if (ratingValues.some(r => r < 1 || r > 5)) {
      showToast('All ratings must be between 1 and 5', 'error');
      return;
    }

    if (!reviewText.trim()) {
      showToast('Please fill in the review text', 'error');
      return;
    }

    if (reviewText.trim().length < 10) {
      showToast('Review text must be at least 10 characters', 'error');
      return;
    }

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
                value={ratings[key]}
                onChange={(e) => setRatings({...ratings, [key]: parseInt(e.target.value) || 1})}
              />
            </div>
          ))}
        </div>
        <textarea
          placeholder="Your review (at least 10 characters)..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows="5"
        />
        <button type="submit" className="btn-primary">SUBMIT REVIEW</button>
      </form>
    </div>
  );
}

export default ReviewForm;