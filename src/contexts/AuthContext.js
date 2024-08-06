// src/contexts/AuthContext.js

import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(-1);
  const [likedMovies, setLikedMovies] = useState([]);
  const [viewedMovies, setViewedMovies] = useState([]);
  const [likedSeries, setLikedSeries] = useState([]);
  const [viewedSeries, setViewedSeries] = useState([]);

  const fetchLikedMovies = async (user_id) => {
    if (user_id === -1) {
      //navigate('/signin');
      console.log("User not logged.");
    } else {
      try {
        const response = await axios.post('http://localhost:5000/api/movies/getLikedMovies', {
          userId: user_id
        });
        if (response.data.success) {
          console.log("Liked movies fetched.");
          setLikedMovies(response.data.likedMovies);
          console.log(response.data.likedMovies);
        } else {
          alert('Error fetching likes: ' + response.data.message);
        }
      } catch (error) {
        alert('Error fetching likes: ' + error);
      }
    }
  };

  const fetchViewedMovies = async (user_id) => {
    if (user_id === -1) {
      //navigate('/signin');
    } else {
      try {
        const response = await axios.post('http://localhost:5000/api/movies/getViewedMovies', {
          userId: user_id
        });
        if (response.data.success) {
          setViewedMovies(response.data.viewedMovies);
        } else {
          alert('Error fetching viewed movies: ' + response.data.message);
        }
      } catch (error) {
        alert('Error fetching viewed movies: ' + error);
      }
    }
  };

  const fetchLikedSeries = async (user_id) => {
    if(user_id == -1) {
      //navigate('/signin');
    }
    else {
      try {
        const response = await axios.post('http://localhost:5000/api/series/getLikedSeries', {
          userId: user_id
        });
        if (response.data.success) {
          setLikedSeries(response.data.likedSeries);
        } else {
          alert('Error fetching likes: ' + response.data.message);
        }
      } catch (error) {
        alert('Error fetching likes: ' + error);
      }
    }
  };

  const fetchViewedSeries = async (user_id) => {
    if(user_id == -1) {
      //navigate('/signin');
    }
    else {
      try {
        const response = await axios.post('http://localhost:5000/api/series/getViewedSeries', {
          userId: user_id
        });
        if (response.data.success) {
          setViewedSeries(response.data.viewedSeries);
        } else {
          alert('Error fetching viewed series: ' + response.data.message);
        }
      } catch (error) {
        alert('Error fetching viewed series: ' + error);
      }
    }
  };

  const login = async (userId) => {
    setIsLoggedIn(true);
    setUserId(userId);
    // Wait for all fetches to complete
    await Promise.all([
      fetchLikedMovies(userId),
      fetchViewedMovies(userId),
      fetchLikedSeries(userId),
      fetchViewedSeries(userId)
    ]);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserId(-1); // Reset userId on logout
    setLikedMovies([]);
    setViewedMovies([]);
    setLikedSeries([]);
    setViewedSeries([]);
  };

  return (
    <AuthContext.Provider value={{ 
        isLoggedIn, 
        login, 
        logout, 
        userId, 
        likedMovies, 
        setLikedMovies, 
        viewedMovies, 
        setViewedMovies,
        likedSeries, 
        setLikedSeries, 
        viewedSeries, 
        setViewedSeries
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
