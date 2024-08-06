import React, { useState, useEffect } from 'react';
import { Container, Typography, Tabs, Tab, Grid } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import MovieList from '../components/MovieList'; // Import MovieList component
import SeriesList from '../components/SerieList'; // Import SeriesList component

function ViewedMediaPage() {
  const { userId: authUserId } = useAuth();
  const { userId: routeUserId } = useParams();
  const [value, setValue] = useState(0);
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);

  // Determine if it is own profile
  const isOwnProfile = routeUserId === '0' || !routeUserId;
  const currentUserId = isOwnProfile ? authUserId : routeUserId;

  useEffect(() => {
    if (currentUserId === -1) {
      console.log("User not logged in.");
    } else {
      // Fetch viewed movies
      axios.post('http://localhost:5000/api/movies/getViewedMoviesInfo', { userId: currentUserId })
        .then(response => {
          if (response.data.success) {
            setMovies(response.data.viewedMovies);
          } else {
            console.error('Failed to fetch viewed movies:', response.data.message);
          }
        })
        .catch(error => {
          console.error('Error fetching viewed movies:', error);
        });

      // Fetch viewed series
      axios.post('http://localhost:5000/api/series/getViewedSeriesInfo', { userId: currentUserId })
        .then(response => {
          if (response.data.success) {
            setSeries(response.data.viewedSeries);
          } else {
            console.error('Failed to fetch viewed series:', response.data.message);
          }
        })
        .catch(error => {
          console.error('Error fetching viewed series:', error);
        });
    }
  }, [currentUserId]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Viewed Media
      </Typography>
      <Tabs value={value} onChange={handleChange} aria-label="viewed media tabs">
        <Tab label="Movies" />
        <Tab label="Series" />
      </Tabs>
      <Grid container spacing={3}>
        {value === 0 && (
          <Grid item xs={12}>
            <MovieList title="Viewed Movies" movies={movies} />
          </Grid>
        )}
        {value === 1 && (
          <Grid item xs={12}>
            <SeriesList title="Viewed Series" series={series} />
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

export default ViewedMediaPage;
