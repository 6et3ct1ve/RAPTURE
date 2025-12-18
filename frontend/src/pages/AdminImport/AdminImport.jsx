import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../components/Toast/ToastContext';
import Spinner from '../../components/Spinner/Spinner';
import './AdminImport.css';

function AdminImport() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isAdmin, setIsAdmin] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await api.get('/accounts/profile/');
        setIsAdmin(response.data.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (searchQuery.length < 2) {
      showToast('Enter at least 2 characters', 'error');
      return;
    }

    setIsSearching(true);
    try {
      const { data } = await api.get(`/games/steam/search/?q=${searchQuery}`);
      setSearchResults(data.results || []);
      if (data.results.length === 0) {
        showToast('No games found', 'info');
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        showToast('Admin access required', 'error');
        navigate('/');
      } else {
        showToast('Search failed', 'error');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleImport = async (appid, name) => {
    try {
      await api.post('/games/steam/import/', { appid });
      showToast(`Imported: ${name}`, 'success');
      setSearchResults(searchResults.filter(game => game.appid !== appid));
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409) {
        showToast('Game already exists', 'error');
      } else {
        showToast(err.response?.data?.error || 'Import failed', 'error');
      }
    }
  };

  const handleBulkImport = async () => {
    setIsImporting(true);
    try {
      const { data } = await api.post('/games/steam/bulk-import/', { limit: 20 });
      showToast(`Imported ${data.imported} games (${data.skipped} skipped)`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Bulk import failed', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  if (isAdmin === null) return <div>Loading...</div>;
  if (!isAdmin) return <div className="admin-import-container"><h2>Access Denied</h2></div>;

  return (
    <div className="admin-import">
      <h1>// IMPORT GAMES FROM STEAM</h1>

      <div className="import-section">
        <button 
          onClick={handleBulkImport} 
          className="btn-primary bulk-btn"
          disabled={isImporting}
        >
          {isImporting ? 'IMPORTING...' : 'IMPORT GAMES'}
        </button>
      </div>

      <div className="import-section">
        <h2>// SEARCH STEAM</h2>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search for a game..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn-secondary" disabled={isSearching}>
            {isSearching ? 'SEARCHING...' : 'SEARCH'}
          </button>
        </form>
      </div>

      {isSearching && <Spinner />}

      {searchResults.length > 0 && (
        <div className="search-results">
          <h3>Results ({searchResults.length})</h3>
          <div className="results-list">
            {searchResults.map(game => (
              <div key={game.appid} className="result-item">
                <div className="game-info">
                  <span className="game-name">{game.name}</span>
                  <span className="game-appid">AppID: {game.appid}</span>
                </div>
                <button 
                  onClick={() => handleImport(game.appid, game.name)}
                  className="btn-primary import-btn"
                >
                  IMPORT
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminImport;