import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import './App.css';

import Home from './pages/Home/Home';
import Games from './pages/Games/Games';
import Reviews from './pages/Reviews/Reviews';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import GameDetail from './pages/GameDetail/GameDetail';
import ReviewDetail from './pages/ReviewDetail/ReviewDetail';
import Profile from './pages/Profile/Profile';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<Games />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/games/:id" element={<GameDetail />} />
          <Route path="/reviews/:id" element={<ReviewDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;