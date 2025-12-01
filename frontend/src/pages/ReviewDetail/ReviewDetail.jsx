import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Modal from '../../components/Modal/Modal';
import { useToast } from '../../components/Toast/ToastContext';
import Spinner from '../../components/Spinner/Spinner';
import './ReviewDetail.css';

function ReviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [review, setReview] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    gameplay: 0,
    graphics: 0,
    story: 0,
    sound: 0,
    replayability: 0,
    text: ''
  });
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewRes, commentsRes] = await Promise.all([
          api.get(`/reviews/${id}/`),
          api.get(`/reviews/${id}/comments/`)
        ]);
        setReview(reviewRes.data);
        setEditData({
          gameplay: reviewRes.data.gameplay,
          graphics: reviewRes.data.graphics,
          story: reviewRes.data.story,
          sound: reviewRes.data.sound,
          replayability: reviewRes.data.replayability,
          text: reviewRes.data.text
        });
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
      showToast('Please log in to like reviews', 'error');
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
      showToast('Comment posted successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Please log in to comment', 'error');
    }
  };

  const handleDeleteReview = () => {
    setModalConfig({
      isOpen: true,
      title: '// DELETE REVIEW',
      message: 'Are you sure you want to delete this review? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await api.delete(`/reviews/admin/${id}/`);
          showToast('Review deleted successfully', 'success');
          navigate('/reviews');
        } catch (err) {
          console.error(err);
          showToast('Failed to delete review', 'error');
        }
        setModalConfig({ ...modalConfig, isOpen: false });
      }
    });
  };

  const handleDeleteComment = (commentId) => {
    setModalConfig({
      isOpen: true,
      title: '// DELETE COMMENT',
      message: 'Are you sure you want to delete this comment?',
      onConfirm: async () => {
        try {
          await api.delete(`/reviews/comments/admin/${commentId}/`);
          const { data } = await api.get(`/reviews/${id}/comments/`);
          const commentsData = data.results || data;
          setComments(Array.isArray(commentsData) ? commentsData : []);
          showToast('Comment deleted successfully', 'success');
        } catch (err) {
          console.error(err);
          showToast('Failed to delete comment', 'error');
        }
        setModalConfig({ ...modalConfig, isOpen: false });
      }
    });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/reviews/${id}/`, editData);
      const { data } = await api.get(`/reviews/${id}/`);
      setReview(data);
      setIsEditing(false);
      showToast('Review updated successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update review', 'error');
    }
  };

  const handleDeleteOwn = () => {
    setModalConfig({
      isOpen: true,
      title: '// DELETE REVIEW',
      message: 'Are you sure you want to delete this review? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await api.delete(`/reviews/${id}/`);
          showToast('Review deleted successfully', 'success');
          navigate('/reviews');
        } catch (err) {
          console.error(err);
          showToast('Failed to delete review', 'error');
        }
        setModalConfig({ ...modalConfig, isOpen: false });
      }
    });
  };

  if (!review) return <Spinner />;

  const avgRating = (
    (review.gameplay + review.graphics + review.story + 
     review.sound + review.replayability) / 5
  ).toFixed(1);

  const isOwner = currentUser && currentUser.id === review.user;
  const isAdmin = currentUser?.role === 'admin';

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
          <div className="header-right">
            <div className="review-rating">
              <span className="rating-big">★ {avgRating}</span>
            </div>
            {isAdmin && (
              <button onClick={handleDeleteReview} className="btn-delete-review">
                DELETE
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="edit-review-form">
            <div className="rating-inputs">
              <div className="rating-input-item">
                <label>Gameplay (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={editData.gameplay}
                  onChange={(e) => setEditData({...editData, gameplay: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className="rating-input-item">
                <label>Graphics (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={editData.graphics}
                  onChange={(e) => setEditData({...editData, graphics: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className="rating-input-item">
                <label>Story (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={editData.story}
                  onChange={(e) => setEditData({...editData, story: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className="rating-input-item">
                <label>Sound (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={editData.sound}
                  onChange={(e) => setEditData({...editData, sound: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className="rating-input-item">
                <label>Replayability (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={editData.replayability}
                  onChange={(e) => setEditData({...editData, replayability: parseInt(e.target.value)})}
                  required
                />
              </div>
            </div>

            <textarea
              value={editData.text}
              onChange={(e) => setEditData({...editData, text: e.target.value})}
              rows="10"
              placeholder="Your review..."
              required
            />

            <div className="edit-actions">
              <button type="submit" className="btn-primary">SAVE CHANGES</button>
              <button type="button" onClick={handleEditToggle} className="btn-secondary">
                CANCEL
              </button>
            </div>
          </form>
        ) : (
          <>
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
              {isOwner && (
                <>
                  <button onClick={handleEditToggle} className="btn-edit">
                    EDIT
                  </button>
                  <button onClick={handleDeleteOwn} className="btn-danger">
                    DELETE
                  </button>
                </>
              )}
            </div>
          </>
        )}
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
                  {isAdmin && (
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

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
      />
    </div>
  );
}

export default ReviewDetail;