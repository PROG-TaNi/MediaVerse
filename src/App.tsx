import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';

// Layout Components
import Layout from './components/layout/Layout';
import AuthGuard from './components/layout/AuthGuard';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import BrowsePage from './pages/BrowsePage';
import SearchResultsPage from './pages/SearchResultsPage';
import ContentDetailPage from './pages/ContentDetailPage';
import ProfilePage from './pages/ProfilePage';
import WatchlistPage from './pages/WatchlistPage';
import NotFoundPage from './pages/NotFoundPage';
import MoviesPage from './pages/MoviesPage';
import BooksPage from './pages/BooksPage';
import MusicPage from './pages/MusicPage';
import ArtistPage from './pages/ArtistPage';
import PrivacyPolicyPage from './pages/privacy';
import AboutPage from './pages/about';
import TermsPage from './pages/terms';
import ContactPage from './pages/contact';

function App() {
  const { isDarkMode } = useThemeStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Render these pages without Layout (no Navbar) */}
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        {/* All other pages use Layout (with Navbar) */}
        <Route
          path="*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />} />
                <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
                <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/browse" element={<AuthGuard><BrowsePage /></AuthGuard>} />
                <Route path="/browse/:type" element={<AuthGuard><BrowsePage /></AuthGuard>} />
                <Route path="/content/:id" element={<AuthGuard><ContentDetailPage /></AuthGuard>} />
                <Route path="/content/:type/:id" element={<AuthGuard><ContentDetailPage /></AuthGuard>} />
                <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
                <Route path="/watchlist" element={<AuthGuard><WatchlistPage /></AuthGuard>} />
                <Route path="/search" element={<AuthGuard><SearchResultsPage /></AuthGuard>} />
                <Route path="/movies" element={<MoviesPage />} />
                <Route path="/books" element={<BooksPage />} />
                <Route path="/music" element={<MusicPage />} />
                <Route path="/artist/:artistName" element={<ArtistPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;