import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('access_token');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications/');
      setNotifications(data.results || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read/`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

const handleMarkAllRead = async (e) => {
  e.stopPropagation();
  try {
    await api.post('/notifications/mark-all-read/');
    fetchNotifications();
  } catch (err) {
    console.error(err);
  }
};

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">[ RAPTURE ]</Link>
        
        <nav className="nav">
          {isLoggedIn ? (
            <>
              <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
                <span className="bell-icon">🔔</span>
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                
                {showNotifications && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <h3>// NOTIFICATIONS</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAllRead(e);
                            }} 
                          className="mark-all-btn"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    
                    <div className="notification-list">
                      {notifications.length > 0 ? (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                            onClick={() => handleMarkAsRead(notif.id)}
                          >
                            <p className="notification-message">{notif.message}</p>
                            <span className="notification-time">
                              {new Date(notif.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="no-notifications">No notifications</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <Link to="/profile">PROFILE</Link>
              <button onClick={handleLogout} className="logout-btn">LOGOUT</button>
            </>
          ) : (
            <>
              <Link to="/login">LOGIN</Link>
              <Link to="/register">REGISTER</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;