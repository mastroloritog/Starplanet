import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MovieList from './../components/MovieList';
import { Container, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

function Movies4UPage() {
  const [loading, setLoading] = useState(true);
  const { userId } = useAuth();

  if (loading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <MovieList 
        title="4U Movies" 
        movies={recommendedMovies}
      />
    </Container>
  );
}

export default Movies4UPage;
