import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import ReviewCard from '../../components/review/ReviewCard';
import './Profile.css';

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (id) {
          const [userRes, reviewsRes] = await Promise.all([
            api.get(`/accounts/profile/${id}/`),
            api.get(`/reviews/?user=${id}`)
          ]);
          setUser(userRes.data);
          setReviews(reviewsRes.data.results || reviewsRes.data);
          setIsOwnProfile(false);
        } else {
          const [userRes, reviewsRes] = await Promise.all([
            api.get('/accounts/profile/'),
            api.get('/reviews/')
          ]);
          setUser(userRes.data);
          const myReviews = (reviewsRes.data.results || reviewsRes.data).filter(
            r => r.user === userRes.data.id
          );
          setReviews(myReviews);
          setIsOwnProfile(true);
        }
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          navigate('/login');
        }
      }
    };
    fetchProfile();
  }, [id, navigate]);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <Link to="/" className="back-link">← Back to home</Link>

      <div className="profile-header card">
        <h1>[ {user.username} ]</h1>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        <p>Member since: {new Date(user.created_at).toLocaleDateString()}</p>
      </div>

      <div className="profile-reviews">
        <h2>// REVIEWS ({reviews.length})</h2>
        <div className="reviews-list">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;