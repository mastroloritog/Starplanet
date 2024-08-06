// src/App.js

import './index.css';
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PopularMoviesPage from './pages/PopularMoviesPage';
import PopularSeriesPage from './pages/PopularSeriesPage';
import SigninPage from './pages/SigninPage';
import SignupPage from './pages/SignupPage';
import AccountPage from './pages/AccountPage';
import MediaSearch from './components/MediaSearch';
import Navbar from './components/Navbar';
import CommentsPage from './pages/CommentsPage';
import ViewedMediaPage from './pages/ViewedMediaPage';
import UserSearchPage from './pages/UserSearchPage';
import { Helmet } from 'react-helmet';
import { AuthProvider } from './contexts/AuthContext';
import AnimatedBackground from './components/AnimatedBackground';
import WebFont from 'webfontloader';

function App() {
  useEffect(() => {
    WebFont.load({
      google: {
        families: ['Poppins:400,700', 'sans-serif'],
      },
    });
  }, []);

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      <AuthProvider>
        <Router>
          <Helmet>
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4630961520513915" crossorigin="anonymous"></script>
          </Helmet>
          <div>
            <Navbar />
            <AnimatedBackground />
            <Routes>
              <Route path="/signin" element={<SigninPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/account/:userId" element={<AccountPage />} />
              <Route path="/popularMovies" element={<PopularMoviesPage />} />
              <Route path="/popularSeries" element={<PopularSeriesPage />} />
              <Route path="/comments" element={<CommentsPage />} />
              <Route path="/searchMedia" element={<MediaSearch />} />
              <Route path="/searchUser" element={<UserSearchPage />} />
              <Route path="/viewedMedia/:userId" element={<ViewedMediaPage />} />
              <Route path="/" element={<HomePage />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
