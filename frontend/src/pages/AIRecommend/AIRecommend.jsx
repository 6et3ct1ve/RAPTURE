import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../components/Toast/ToastContext';
import './AIRecommend.css';

function AIRecommend() {
  const { showToast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (prompt.length < 10) {
      showToast('Prompt too short', 'error');
      return;
    }

    setIsLoading(true);
    setRecommendations('');

    try {
      const { data } = await api.post('/games/ai-recommend/', { prompt });
      setRecommendations(data.recommendations);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to get recommendations', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-recommend">
      <Link to="/games" className="back-link">← Back to games</Link>

      <div className="ai-header">
        <h1>// AI GAME RECOMMENDATIONS</h1>
        <p>Ask AI for personalized game suggestions</p>
      </div>

      <form onSubmit={handleSubmit} className="ai-form">
        <textarea
          placeholder="E.g., recommend me action games like GTA, or games similar to Dark Souls..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          maxLength={500}
          rows={4}
          disabled={isLoading}
        />
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'THINKING...' : 'GET RECOMMENDATIONS'}
        </button>
      </form>

      {recommendations && (
        <div className="ai-results card">
          <h2>// RECOMMENDATIONS</h2>
          <div className="recommendations-content">
            {recommendations.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AIRecommend;