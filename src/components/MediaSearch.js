// src/components/MediaSearch.js

import React, { useState } from 'react';
import axios from 'axios';
import MovieItem from './MovieItem';
import SerieItem from './SerieItem';
import { Box, CircularProgress, Grid } from '@mui/material';
import '../index.css';

function MediaSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm) return;
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/recommendation/search?query=${searchTerm}`);
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', padding: '20px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search for a movie or series..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()} // Trigger search on Enter key
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24px"
              height="24px"
              fill="#fff"
            >
              <path d="M 10 2 C 5.582 2 2 5.582 2 10 C 2 14.418 5.582 18 10 18 C 11.848 18 13.554 17.374 14.935547 16.341797 L 19.292969 20.707031 C 19.683594 21.097656 20.316406 21.097656 20.707031 20.707031 C 21.097656 20.316406 21.097656 19.683594 20.707031 19.292969 L 16.341797 14.935547 C 17.374 13.554 18 11.848 18 10 C 18 5.582 14.418 2 10 2 z M 10 4 C 13.309 4 16 6.691 16 10 C 16 13.309 13.309 16 10 16 C 6.691 16 4 13.309 4 10 C 4 6.691 6.691 4 10 4 z" />
            </svg>
          </button>
        </div>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', margin: '20px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ marginTop: '20px' }}>
          {results.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.imdbID}>
              {item.type === 'movie' ? <MovieItem movie={item} /> : <SerieItem serie={item} />}
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default MediaSearch;
