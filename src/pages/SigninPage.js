// src/pages/SigninPage.js

import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Link, Alert, Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import '../index.css'; // Ensure this imports the CSS styles

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 28, 59, 0.85)', // Semi-transparent background for the form container
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[5],
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  header: {
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
  inputBlur: {
    background: 'rgba(255, 255, 255, 0.1)', // Lighten the background slightly
    backdropFilter: 'blur(10px)', // Apply blur effect
    color: 'white', // Ensure text is white
  },
}));

function SigninPage() {
  const classes = useStyles();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/signin', {
        email,
        password,
      });

      if (response.data.success) {
        // Update the login state
        login(response.data.userId);
        // Redirect to AccountPage on successful login
        setSuccess('Login successful! Redirecting to account...');
        setTimeout(() => navigate('/account/0'), 3000);
      } else {
        setError('Invalid email or password');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <Box className={classes.container}>
          <Typography variant="h4" className={classes.header} gutterBottom>
            Sign in
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          <form className={classes.form} onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputLabelProps={{
                style: { color: 'white' },
              }}
              InputProps={{
                className: classes.inputBlur,
              }}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputLabelProps={{
                style: { color: 'white' },
              }}
              InputProps={{
                className: classes.inputBlur,
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              sx={{marginBottom: '10px', marginTop: '10px'}}
            >
              Sign In
            </Button>
            <Link href="/signup" variant="body2" sx={{color: 'white'}}>
              Don't have an account? Sign Up
            </Link>
          </form>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default SigninPage;
