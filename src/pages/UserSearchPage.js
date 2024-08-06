// src/components/UserSearchPage.js

import React, { useState } from 'react';
import { Container, Typography, List, ListItem, ListItemAvatar, ListItemText, Avatar, Divider, Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';  // Import the custom theme
import '../index.css';  // Ensure this contains the CSS for search-container and search-input

function UserSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!query) return;
    setLoading(true);
    setError('');

    axios.post('http://localhost:5000/api/recommendation/search', { query })
      .then(response => {
        if (response.data.success) {
          setResults(response.data.users);
        } else {
          setError('Failed to fetch search results.');
        }
      })
      .catch(error => {
        console.error('Error fetching search results:', error);
        setError('An error occurred while fetching search results.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleUserClick = (userId) => {
    navigate(`/account/${userId}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '20px'  }}>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search for users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
          <List>
            {results.map(user => (
              <div key={user.userId}>
                <ListItem button onClick={() => handleUserClick(user.userId)}>
                  <ListItemAvatar>
                    <Avatar src={`http://localhost:5000/uploads/profile_images/${user.profileimguri}`} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {user.username}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {user.email}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider />
              </div>
            ))}
          </List>
        )}
        {error && <Typography color="error" sx={{ marginTop: 2 }}>{error}</Typography>}
      </Container>
    </ThemeProvider>
  );
}

export default UserSearchPage;
