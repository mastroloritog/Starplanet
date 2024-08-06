import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieList from './../components/MovieList';
import { Container, CircularProgress } from '@mui/material';

function PopularMoviesPage() {
  const [allMovies, setAllMovies] = useState([]); // Stores all movies fetched initially
  const [visibleMovies, setVisibleMovies] = useState([]); // Stores movies currently visible
  const [loading, setLoading] = useState(true);
  const moviesPerLoad = 6; // Number of movies to show on each scroll

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/movies/top100movies');
        const movies = response.data;
        setAllMovies(movies);
        setVisibleMovies(movies.slice(0, moviesPerLoad)); // Initially show the first chunk
      } catch (error) {
        alert('Error fetching movies: ' + error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Check if user is near bottom of the page
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !loading) {
        setLoading(true);
        // Load more movies
        setVisibleMovies((prevVisibleMovies) => {
          const currentLength = prevVisibleMovies.length;
          const moreMovies = allMovies.slice(currentLength, currentLength + moviesPerLoad);
          return [...prevVisibleMovies, ...moreMovies];
        });
        setLoading(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [allMovies, loading]);

  return (
    <Container>
      <MovieList title="Popular Movies" movies={visibleMovies} />
      {loading && <CircularProgress />}
      {visibleMovies.length >= allMovies.length && (
        <p style={{ textAlign: 'center' }}>Yay! You have seen it all</p>
      )}
    </Container>
  );
}

export default PopularMoviesPage;



// Old Without load other during scroll

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import MovieList from './../components/MovieList';
// import { Container, CircularProgress } from '@mui/material';

// function PopularMoviesPage() {
//   const [popularMovies, setPopularMovies] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchMovies = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/movies/top100movies');
//         const movies = response.data;
//         console.log(response.data[0])
//         setPopularMovies(movies);
//       } catch (error) {
//         alert('Error fetching movies: ' + error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMovies();
//   }, []);

//   if (loading) {
//     return (
//       <Container>
//         <CircularProgress />
//       </Container>
//     );
//   }

//   return (
//     <Container>
//       <MovieList
//         title="Popular Movies"
//         movies={popularMovies}
//       />
//     </Container>
//   );
// }

// export default PopularMoviesPage;