import React from 'react';
import MovieItem from './MovieItem';
import { Grid } from '@mui/material';

function MovieList({ title, movies }) {
  return (
    <div>
      <h2>{title}</h2>
      <Grid container spacing={4}>
        {movies.map((movie) => (
          <Grid item key={movie.id} xs={12} sm={6} md={4}>
            <MovieItem
              movie={movie}
            />
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default MovieList;












// import React from 'react';
// import MovieItem from './MovieItem';
// import { Grid } from '@mui/material';

// function MovieList({ title, movies }) {
//   return (
//     <div>
//       <h2>{title}</h2>
//       <Grid container spacing={4}>
//         {movies.map((movie) => (
//           <Grid item key={movie.id} xs={12} sm={6} md={4}>
//             <MovieItem movie={movie} />
//           </Grid>
//         ))}
//       </Grid>
//     </div>
//   );
// }

// export default MovieList;




//OLD

