import { useState, useEffect } from 'react';
import api from '../../services/api';
import ReviewCard from '../../components/review/ReviewCard';
import './Reviews.css';

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_new');

  useEffect(() => {
    fetchReviews();
  }, [sortBy]);

  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/reviews/?sort_by=${sortBy}`);
      setReviews(data.results || data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (query.length < 2) {
      fetchReviews();
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/search/reviews/?q=${query}`);
        setReviews(data.results || []);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setQuery('');
  };

  return (
    <div>
      <div className="page-header">
        <h1>// REVIEWS</h1>
        <div className="controls">
          <input
            type="text"
            placeholder="Search by username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          <select 
            value={sortBy} 
            onChange={(e) => handleSortChange(e.target.value)}
            className="sort-select"
          >
            <option value="date_new">Newest First</option>
            <option value="date_old">Oldest First</option>
            <option value="rating_high">Highest Rating</option>
            <option value="rating_low">Lowest Rating</option>
          </select>
        </div>
      </div>

      <div className="reviews-list">
        {reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {reviews.length === 0 && (
        <p className="no-results">No reviews found</p>
      )}
    </div>
  );
}

export default Reviews;