import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardMedia, Typography, IconButton, Box, Skeleton } from '@mui/material';
import { Share, Favorite, FavoriteBorder, Comment, Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function SerieItem({ serie }) {
  const [likeCount, setLikeCount] = useState(0);
  const [loadingLikes, setLoadingLikes] = useState(true);
  const [visualsCount, setVisualsCount] = useState(0);
  const [loadingVisuals, setLoadingVisuals] = useState(true);
  const { userId, likedSeries, setLikedSeries, viewedSeries, setViewedSeries } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch like count for the serie
    const fetchLikeCount = async () => {
      setLoadingLikes(true);
      try {
        const response = await axios.post('http://localhost:5000/api/series/countLikesSerie', { serieId: serie.id });
        if (response.data.success) {
          setLikeCount(response.data.likeCount);
        } else {
          console.error('Error fetching like count:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching like count:', error);
      } finally {
        setLoadingLikes(false);
      }
    };

    // Fetch visuals count for the serie
    const fetchVisualsCount = async () => {
      setLoadingVisuals(true);
      try {
        const response = await axios.post('http://localhost:5000/api/series/countVisualsSerie', { serieId: serie.id });
        if (response.data.success) {
          setVisualsCount(response.data.visualsCount);
        } else {
          console.error('Error fetching visuals count:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching visuals count:', error);
      } finally {
        setLoadingVisuals(false);
      }
    };

    fetchLikeCount();
    fetchVisualsCount();
  }, [serie.id]);

  const handleLike = async (serieId) => {
    if (userId === -1) {
      navigate('/signin');
    } else {
      try {
        const response = await axios.post('http://localhost:5000/api/series/likeSerie', {
          userId: userId,
          serieId: serieId
        });
        if (response.data.success) {
          if (likedSeries.includes(serieId)) {
            setLikedSeries(likedSeries.filter(id => id !== serieId));
          } else {
            setLikedSeries([...likedSeries, serieId]);
          }
        } else {
          alert('Error liking series: ' + response.data.message);
        }
      } catch (error) {
        alert('Error liking series: ' + error);
      }
    }
  };

  const handleView = async (serieId) => {
    if (userId === -1) {
      navigate('/signin');
    } else {
      try {
        const response = await axios.post('http://localhost:5000/api/series/setSerieViewed', {
          userId: userId,
          serieId: serieId
        });
        if (response.data.success) {
          if (viewedSeries.includes(serieId)) {
            setViewedSeries(viewedSeries.filter(id => id !== serieId));
          } else {
            setViewedSeries([...viewedSeries, serieId]);
          }
        } else {
          alert('Error viewing series: ' + response.data.message);
        }
      } catch (error) {
        alert('Error viewing series: ' + error);
      }
    }
  };

  const handleLikeClick = async () => {
    await handleLike(serie.id);
    setLikeCount((prevLikeCount) => likedSeries.includes(serie.id) ? prevLikeCount - 1 : prevLikeCount + 1);
  };

  const handleViewClick = async () => {
    await handleView(serie.id);
    setVisualsCount((prevVisualCount) => viewedSeries.includes(serie.id) ? prevVisualCount - 1 : prevVisualCount + 1);
  };

  const handleShare = () => {
    // Logic for sharing
  };

  const handleComment = () => {
    navigate('/comments', { state: { media: serie, type: 'serie' } });
  };

  const calculateFontSize = (length) => {
    if (length <= 20) return '1.2rem';
    if (length <= 30) return '1.1rem';
    if (length <= 40) return '1rem';
    if (length <= 50) return '0.9rem';
    return '0.8rem';
  };

  const titleFontSize = calculateFontSize(serie.title.length);

  return (
    <Card 
      sx={{
        maxWidth: 345,
        margin: '16px',
        padding: '10px',
        backgroundColor: 'primary.main',
        color: 'text.primary',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        '&:hover': {
          backgroundColor: 'secondary.main',
        },
      }}
    >
      <CardMedia
        component="img"
        height="500"
        image={serie.image}
        alt={serie.title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          <Typography gutterBottom variant="h5" component="div" sx={{ fontSize: titleFontSize, fontWeight: 'bold' }}>
            {serie.title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.primary">
          Genre:{" "}
          {serie.genre.map((genre, index) => (
            <React.Fragment key={index}>
              {index > 0 && ' - '}
              {genre}
            </React.Fragment>
          ))}
        </Typography>
        <Typography variant="body2" color="text.primary">
          Year: {serie.year}
        </Typography>
      </CardContent>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '8px',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>
          <IconButton onClick={handleLikeClick} aria-label="like" sx={{ color: 'text.primary' }}>
            {likedSeries.includes(serie.id) ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
          {loadingLikes ? <Skeleton width={35} height={15} sx={{ bgcolor: 'white' }} /> : likeCount}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>
          <IconButton onClick={handleViewClick} aria-label="visuals" sx={{ color: 'text.primary' }}>
            {viewedSeries.includes(serie.id) ? <Visibility /> : <VisibilityOff />}
          </IconButton>
          {loadingVisuals ? <Skeleton width={35} height={15} sx={{ bgcolor: 'white' }} /> : visualsCount}
        </Box>
        <IconButton onClick={handleShare} aria-label="share" sx={{ color: 'text.primary' }}>
          <Share />
        </IconButton>
        <IconButton onClick={handleComment} aria-label="comment" sx={{ color: 'text.primary' }}>
          <Comment />
        </IconButton>
      </Box>
    </Card>
  );
}

export default SerieItem;