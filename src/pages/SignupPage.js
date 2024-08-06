import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Link, Alert, Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';

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

function SignupPage() {
  const classes = useStyles();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        email,
        password,
      });

      if (response.data.success) {
        setSuccess('Registration successful! Redirecting to signin...');
        setTimeout(() => navigate('/signin'), 3000);
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error registering:', error);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <Box className={classes.container}>
          <Typography variant="h4" className={classes.header} gutterBottom>
            Sign Up
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
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="current-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              sx={{ marginBottom: '10px', marginTop: '10px' }}
            >
              Sign Up
            </Button>
            <Link href="/signin" variant="body2" sx={{ color: 'white' }}>
              Already have an account? Sign in
            </Link>
          </form>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default SignupPage;
