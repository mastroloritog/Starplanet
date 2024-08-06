import React from 'react';
import { Container } from '@mui/material';
import { useLocation } from 'react-router-dom';
import MediaInfo from '../components/MediaInfo';
import CommentsSection from '../components/CommentsSection';

function CommentsPage() {
  const location = useLocation();
  const { media, type } = location.state;

  return (
    <Container>
      <MediaInfo media={media} type={type} />
      <CommentsSection mediaId={media.id} type={type} />
    </Container>
  );
}

export default CommentsPage;
