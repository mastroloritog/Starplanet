import React from 'react';
import SerieItem from './SerieItem';
import { Grid } from '@mui/material';

function SerieList({ title, series }) {
  return (
    <div>
      <h2>{title}</h2>
      <Grid container spacing={4}>
        {series.map((serie) => (
          <Grid item key={serie.id} xs={12} sm={6} md={4}>
            <SerieItem
              serie={serie}
            />
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default SerieList;