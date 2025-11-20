import { useState, useEffect } from 'react';
import api from '../../services/api';
import GameCard from '../../components/game/GameCard';
import ReviewCard from '../../components/review/ReviewCard';
import './Home.css';

function Home() {
  const [games, setGames] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesRes, reviewsRes] = await Promise.all([
          api.get('/games/'),
          api.get('/reviews/')
        ]);
        setGames(gamesRes.data.results || gamesRes.data);
        setReviews(reviewsRes.data.results || reviewsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <section className="games-section">
        <h2>// GAMES</h2>
        <div className="games-grid">
          {games.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      <section className="reviews-section">
        <h2>// RECENT REVIEWS</h2>
        <div className="reviews-list">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;