// src/pages/HomePage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import '../index.css';
import WebFont from 'webfontloader';

function HomePage() {
  // const [loading, setLoading] = useState(false);
  // const [userTopGenres, setUserTopGenres] = useState(true);
  // const { userId } = useAuth();

  useEffect(() => {
    WebFont.load({
      google: {
        families: ['Poppins:400,700', 'sans-serif'],
      },
    });
  }, []);
  
  // useEffect(() => {
  //   // Fetch like count for the movie
  //   const getUserTopGenres = async () => {
  //     if(userId === -1) {
  //       console.log("User not logged.");
  //     }
  //     else {
  //       setLoading(true);
  //       try {
  //         const response = await axios.post('http://localhost:5000/api/recommendation/getUserTopGenres', { userId: userId });
  //         if (response.data.success) {
  //           setUserTopGenres(response.data.userTopGenres);
  //         } else {
  //           console.error('Error fetching like count:', response.data.message);
  //           alert('Error fetching like count:', response.data.message)
  //         }
  //       } catch (error) {
  //         console.error('Error fetching like count:', error);
  //         alert('Error fetching like count:', error)
  //       } finally {
  //         setLoading(false);
  //       }
  //     }
  //   };
  //   getUserTopGenres();
  // }, [userId]);

  // if (loading) {
  //   return (
  //     <Container>
  //       <CircularProgress />
  //     </Container>
  //   );
  // }

  return (
    <Container style={{ fontFamily: 'Poppins, sans-serif' }}>
      <Typography variant="h4" gutterBottom>
        Coming Soon ...
      </Typography>
      {/* <Typography variant="body2" color="text.primary">
          {userTopGenres[0] + "\n"}
          {userTopGenres[1] + "\n"}
          {userTopGenres[2] + "\n"}
      </Typography> */}
    </Container>
  );
}

export default HomePage;
