import React from 'react';
import { Box, Typography, Card, CardMedia, CardContent } from '@mui/material';

function MediaInfo({ media, type }) {
  return (
    <Card sx={{ display: 'flex', mb: 2 }}>
      <CardMedia
        component="img"
        sx={{ width: 200 }}
        image={media.image}
        alt={media.title}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            {media.title}
          </Typography>
          <Typography variant="body2" color="text.primary">
            Genre:{" "}
            {media.genre.map((genre, index) => (
                <React.Fragment key={index}>
                {index > 0 && ' - '}
                {genre}
                </React.Fragment>
            ))}
          </Typography>
          <Typography variant="body2" color="text.primary">
            Year: {media.year}
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );
}

export default MediaInfo;
