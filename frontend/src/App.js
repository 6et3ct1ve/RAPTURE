import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast/ToastContext';
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
import NotFound from './pages/NotFound/NotFound';
import AdminImport from './pages/AdminImport/AdminImport';
import AIRecommend from './pages/AIRecommend/AIRecommend';
import VerifyEmail from './pages/Auth/VerifyEmail';
import PasswordReset from './pages/Auth/PasswordReset';
import PasswordResetConfirm from './pages/Auth/PasswordResetConfirm';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/games" element={<Games />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email/:uidb64/:token" element={<VerifyEmail />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/reset-password/:uidb64/:token" element={<PasswordResetConfirm />} />
            <Route path="/games/:id" element={<GameDetail />} />
            <Route path="/reviews/:id" element={<ReviewDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/admin/import-games" element={<AdminImport />} />
            <Route path="/ai-recommend" element={<AIRecommend />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </ToastProvider>
  );
}

export default App;