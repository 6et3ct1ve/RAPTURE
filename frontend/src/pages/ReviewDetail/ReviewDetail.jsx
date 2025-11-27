import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './ReviewDetail.css';

function ReviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewRes, commentsRes] = await Promise.all([
          api.get(`/reviews/${id}/`),
          api.get(`/reviews/${id}/comments/`)
        ]);
        setReview(reviewRes.data);
        const commentsData = commentsRes.data.results || commentsRes.data;
        setComments(Array.isArray(commentsData) ? commentsData : []);
        
        const token = localStorage.getItem('access_token');
        if (token) {
          const userRes = await api.get('/accounts/profile/');
          setCurrentUser(userRes.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id]);

  const handleLike = async () => {
    try {
      await api.post(`/reviews/${id}/like/`);
      const { data } = await api.get(`/reviews/${id}/`);
      setReview(data);
    } catch (err) {
      console.error(err);
      alert('Please log in to like reviews');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/reviews/${id}/comments/`, { text: commentText });
      setCommentText('');
      const { data } = await api.get(`/reviews/${id}/comments/`);
      const commentsData = data.results || data;
      setComments(Array.isArray(commentsData) ? commentsData : []);
    } catch (err) {
      console.error(err);
      alert('Please log in to comment');
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm('Delete this review?')) return;
    
    try {
      await api.delete(`/reviews/admin/${id}/`);
      alert('Review deleted');
      navigate('/reviews');
    } catch (err) {
      console.error(err);
      alert('Failed to delete review');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    
    try {
      await api.delete(`/reviews/comments/admin/${commentId}/`);
      const { data } = await api.get(`/reviews/${id}/comments/`);
      const commentsData = data.results || data;
      setComments(Array.isArray(commentsData) ? commentsData : []);
    } catch (err) {
      console.error(err);
      alert('Failed to delete comment');
    }
  };

  if (!review) return <div>Loading...</div>;

  const avgRating = (
    (review.gameplay + review.graphics + review.story + 
     review.sound + review.replayability) / 5
  ).toFixed(1);

  return (
    <div>
      <Link to="/reviews" className="back-link">← Back to reviews</Link>

      <div className="review-detail-card card">
        <div className="review-detail-header">
          <div>
            <h1>{review.game_title}</h1>
            <p>Review by {review.username}</p>
            <p className="review-date">{new Date(review.created_at).toLocaleDateString()}</p>
          </div>
          <div className="review-rating">
            <span className="rating-big">★ {avgRating}</span>
          </div>
        </div>

        <div className="review-ratings-detail">
          <div className="rating-item">
            <span>Gameplay</span>
            <span>★ {review.gameplay}</span>
          </div>
          <div className="rating-item">
            <span>Graphics</span>
            <span>★ {review.graphics}</span>
          </div>
          <div className="rating-item">
            <span>Story</span>
            <span>★ {review.story}</span>
          </div>
          <div className="rating-item">
            <span>Sound</span>
            <span>★ {review.sound}</span>
          </div>
          <div className="rating-item">
            <span>Replayability</span>
            <span>★ {review.replayability}</span>
          </div>
        </div>

        <div className="review-text">
          <p>{review.text}</p>
        </div>

        <div className="review-actions">
          <button onClick={handleLike}>
            ♥ {review.likes_count || 0}
          </button>
          {currentUser?.role === 'admin' && (
            <button onClick={handleDeleteReview} className="btn-danger">
              DELETE REVIEW
            </button>
          )}
        </div>
      </div>

      <div className="comments-section card">
        <h2>// COMMENTS ({comments.length})</h2>
        
        <form onSubmit={handleComment} className="comment-form">
          <textarea
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows="3"
            required
          />
          <button type="submit" className="btn-primary">POST COMMENT</button>
        </form>

        <div className="comments-list">
          {comments.length > 0 ? (
            comments.map(comment => (
              <div key={comment.id} className="comment-item">
                <p className="comment-author">{comment.username}</p>
                <p className="comment-text">{comment.text}</p>
                <div className="comment-footer">
                  <p className="comment-date">{new Date(comment.created_at).toLocaleDateString()}</p>
                  {currentUser?.role === 'admin' && (
                    <button onClick={() => handleDeleteComment(comment.id)} className="btn-delete-small">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-comments">No comments yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewDetail;