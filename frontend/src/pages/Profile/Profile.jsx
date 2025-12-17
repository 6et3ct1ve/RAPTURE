import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import ReviewCard from '../../components/review/ReviewCard';
import { useToast } from '../../components/Toast/ToastContext';
import Spinner from '../../components/Spinner/Spinner';
import './Profile.css';

const DISCORD_OAUTH2_URL = `https://discord.com/oauth2/authorize?client_id=${process.env.REACT_APP_DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.REACT_APP_DISCORD_CALLBACK_URL)}&scope=identify`;

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [discordUser, setDiscordUser] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const callbackHandled = useRef(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        
        if (id) {
          const [userRes, reviewsRes] = await Promise.all([
            api.get(`/accounts/profile/${id}/`),
            api.get(`/reviews/user/${id}/`)
          ]);
          setUser(userRes.data);
          setReviews(reviewsRes.data.results || reviewsRes.data);
          setIsOwnProfile(false);
        } else {
          const userRes = await api.get('/accounts/profile/');
          const reviewsRes = await api.get(`/reviews/user/${userRes.data.id}/`);
          setUser(userRes.data);
          setReviews(reviewsRes.data.results || reviewsRes.data);
          setIsOwnProfile(true);
          
          if (code && !callbackHandled.current) {
            callbackHandled.current = true;
            
            console.log('Discord code detected and being handled:', code);
            window.history.replaceState({}, '', '/profile');
            
            await handleDiscordCallback(code);
          }
          if (!code) { 
            await fetchDiscordUser();
          }
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

  const fetchDiscordUser = async () => {
    try {
      const response = await api.get('/accounts/discord/user/');
      setDiscordUser(response.data);
    } catch (err) {
      console.log('Discord not linked:', err);
      setDiscordUser(null);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      showToast('New passwords do not match', 'error');
      return;
    }
    
    if (passwordData.new_password.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    
    try {
      await api.post('/accounts/password/', passwordData);
      showToast('Password changed successfully', 'success');
      setShowPasswordForm(false);
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Failed to change password', 'error');
    }
  };

  const handleDiscordLink = () => {
    window.location.href = DISCORD_OAUTH2_URL;
  };

  const handleDiscordCallback = async (code) => {
    console.log('Handling Discord callback with code:', code);
    
    window.history.replaceState({}, '', '/profile'); 

    try {
      const response = await api.post('/accounts/discord/callback/', { code });
      console.log('Backend response:', response.data);
      
      await fetchDiscordUser();
      
      alert('Discord account linked successfully!');
    } catch (err) {
      console.error('Discord callback error:', err);
      console.error('Error details:', err.response?.data);
      alert(err.response?.data?.error || 'Failed to link Discord account. Please try again.');
    }
  };  

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <Link to="/" className="back-link">← Back to home</Link>

      <div className="profile-header card">
        <h1>[ {user.username} ]</h1>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        <p>Member since: {new Date(user.created_at).toLocaleDateString()}</p>
        
        {isOwnProfile && (
          <>
            <button 
              onClick={() => setShowPasswordForm(!showPasswordForm)} 
              className="btn-secondary"
            >
              {showPasswordForm ? 'CANCEL' : 'CHANGE PASSWORD'}
            </button>
            
            {discordUser ? (
              <div className="discord-linked">
                <p>✓ Discord Linked</p>
                <p>Username: {discordUser.username}</p>
                {discordUser.global_username && (
                  <p>Global Name: {discordUser.global_username}</p>
                )}
              </div>
            ) : (
              <button 
                onClick={handleDiscordLink} 
                className="btn-primary"
              >
                LINK TO DISCORD
              </button>
            )}
          </>
        )}
      </div>

      {showPasswordForm && (
        <div className="password-form card">
          <h2>// CHANGE PASSWORD</h2>
          <form onSubmit={handlePasswordChange}>
            <input
              type="password"
              placeholder="Old Password"
              value={passwordData.old_password}
              onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
              required
            />
            <input
              type="password"
              placeholder="New Password (min 8 characters)"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
              required
            />
            <button type="submit" className="btn-primary">SAVE PASSWORD</button>
          </form>
        </div>
      )}

      <div className="profile-stats card">
        <h2>// STATISTICS</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Total Reviews</span>
            <span className="stat-value">{user.reviews_count}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average Rating Given</span>
            <span className="stat-value">★ {user.average_rating_given}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Likes Received</span>
            <span className="stat-value">♥ {user.total_likes_received}</span>
          </div>
        </div>
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