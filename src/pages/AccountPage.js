import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Avatar,
  Grid,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  CircularProgress,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import "../index.css";

const useStyles = makeStyles((theme) => ({
  primaryText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Poppins, sans-serif'
  },
  secondaryText: {
    color: 'white',
    fontFamily: 'Poppins, sans-serif'
  },
  avatar: {
    width: theme.spacing(15),
    height: theme.spacing(15),
    marginBottom: theme.spacing(2),
  },
  inputContainer: {
    marginBottom: theme.spacing(2),
    fontFamily: 'Poppins, sans-serif'
  },
  button: {
    marginTop: theme.spacing(2),
    fontFamily: 'Poppins, sans-serif'
  },
  input: {
    "& input.Mui-disabled": {
      color: "green"
    },
    fontFamily: 'Poppins, sans-serif'
  }
}));

function AccountPage() {
  const classes = useStyles();
  const { logout, userId: authUserId } = useAuth();
  const navigate = useNavigate();
  const { userId: routeUserId } = useParams();
  console.log(authUserId);
  const isOwnProfile = routeUserId === '0' || routeUserId === authUserId;
  const [userInfo, setUserInfo] = useState({
    userId: isOwnProfile ? authUserId : routeUserId,
    username: '',
    email: '',
    gender: '',
    birthday: '',
    language: '',
    profileimguri: null,
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [birthdayError, setBirthdayError] = useState('');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const currentUserId = isOwnProfile ? authUserId : routeUserId;
    axios
      .post('http://localhost:5000/api/auth/getUserInfo', { userId: currentUserId })
      .then((response) => {
        if (response.data.success) {
          const userData = response.data.message;
          userData.birthday = new Date(userData.birthday).toISOString().split('T')[0];
          setUserInfo(userData);
        } else {
          console.error('Failed to fetch user info:', response.data.message);
        }
      })
      .catch((error) => {
        console.error('Error fetching user info:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [authUserId, routeUserId, isOwnProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'birthday') {
      const date = new Date(value);
      if (isNaN(date)) {
        setBirthdayError('Invalid date');
      } else {
        setBirthdayError('');
      }
    }
    setUserInfo({
      ...userInfo,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      alert('Please select an image file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', imageFile);
    formData.append('userId', userInfo.userId);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/uploadProfileImage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setUserInfo({
          ...userInfo,
          profileimguri: response.data.imageUrl,
        });
        alert('Profile image updated successfully');
      } else {
        console.error('Failed to upload image:', response.data.message);
        alert(`Failed to upload image: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('An error occurred while uploading the image');
    }
  };

  const handleSave = () => {
    if (birthdayError) {
      return;
    }
    axios
      .post('http://localhost:5000/api/auth/updateUserInfo', userInfo)
      .then((response) => {
        if (response.data.success) {
          alert('User information updated successfully');
        } else {
          console.error('Failed to update user info:', response.data.message);
        }
      })
      .catch((error) => {
        console.error('Error updating user info:', error);
        alert('An error occurred while updating the information');
      });
  };

  const handleSignout = () => {
    logout();
    navigate('/signin');
  };

  const handleViewMedia = () => {
    if (isOwnProfile) {
      navigate('/viewedMedia/0');
    } else {
      navigate(`/viewedMedia/${routeUserId}`);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container sx={{ fontFamily: 'Poppins, sans-serif' }}>
      <Typography variant="h4" gutterBottom>
        Account Information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Avatar
            src={
              userInfo.profileimguri
                ? `http://localhost:5000/uploads/profile_images/${userInfo.profileimguri}`
                : undefined
            }
            alt={`${userInfo.username}'s profile`}
            className={classes.avatar}
          />
          {isOwnProfile && (
            <>
              <input
                accept="image/*"
                type="file"
                onChange={handleFileChange}
                style={{ display: 'block', marginTop: '10px', fontFamily: 'Poppins, sans-serif' }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleImageUpload}
                className={classes.button}
                sx={{ margin: '10px', marginBottom: '30px', fontFamily: 'Poppins, sans-serif' }}
                disabled={!imageFile}
              >
                Upload Image
              </Button>
            </>
          )}
        </Grid>
        <Grid item xs={12} sm={8} sx={{ fontFamily: 'Poppins, sans-serif' }}>
          <div className={classes.inputContainer}>
            <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins, sans-serif' }}>Username</Typography>
            <TextField
              variant="outlined"
              fullWidth
              name="username"
              value={userInfo.username}
              onChange={handleChange}
              className={classes.input}
              disabled={!isOwnProfile}
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "#fff",
                  fontFamily: 'Poppins, sans-serif'
                },
              }}
            />
          </div>
          <div className={classes.inputContainer}>
            <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins, sans-serif' }}>Email</Typography>
            <TextField
              variant="outlined"
              fullWidth
              name="email"
              value={userInfo.email}
              onChange={handleChange}
              className={classes.input}
              disabled={!isOwnProfile}
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "#fff",
                  fontFamily: 'Poppins, sans-serif'
                },
              }}
            />
          </div>
          <div className={classes.inputContainer}>
            <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins, sans-serif' }}>Gender</Typography>
            <FormControl variant="outlined" fullWidth>
              <Select
                name="gender"
                value={userInfo.gender}
                onChange={handleChange}
                className={classes.input}
                disabled={!isOwnProfile}
                sx={{
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "#fff",
                    fontFamily: 'Poppins, sans-serif'
                  },
                }}
              >
                <MenuItem value="M">M</MenuItem>
                <MenuItem value="F">F</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className={classes.inputContainer}>
            <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins, sans-serif' }}>Birthday</Typography>
            <TextField
              variant="outlined"
              fullWidth
              name="birthday"
              type="date"
              value={userInfo.birthday}
              onChange={handleChange}
              className={classes.input}
              error={Boolean(birthdayError)}
              helperText={birthdayError}
              disabled={!isOwnProfile}
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "#fff",
                  fontFamily: 'Poppins, sans-serif'
                },
              }}
            />
          </div>
          <div className={classes.inputContainer}>
            <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins, sans-serif' }}>Language</Typography>
            <FormControl variant="outlined" fullWidth>
              <Select
                name="language"
                value={userInfo.language}
                onChange={handleChange}
                className={classes.input}
                disabled={!isOwnProfile}
                sx={{
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "#fff",
                    fontFamily: 'Poppins, sans-serif'
                  },
                }}
              >
                <MenuItem value="ita">Italian</MenuItem>
                <MenuItem value="eng">English</MenuItem>
                <MenuItem value="esp">Spanish</MenuItem>
                <MenuItem value="fra">French</MenuItem>
                <MenuItem value="deu">German</MenuItem>
                {/* Add more languages as needed */}
              </Select>
            </FormControl>
          </div>
          <div className={classes.inputContainer}>
            <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins, sans-serif' }}>Description</Typography>
            <TextField
              variant="outlined"
              fullWidth
              name="description"
              value={userInfo.description}
              onChange={handleChange}
              className={classes.input}
              multiline
              rows={4}
              disabled={!isOwnProfile}
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  WebkitTextFillColor: "#fff",
                  fontFamily: 'Poppins, sans-serif'
                },
              }}
            />
          </div>
          <div className={classes.inputContainer}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleViewMedia}
              className={classes.button}
              sx={{ margin: '10px', marginBottom: '30px', fontFamily: 'Poppins, sans-serif' }}
            >
              Viewed movies and series
            </Button>
          </div>
        </Grid>
      </Grid>
      {isOwnProfile ? (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            className={classes.button}
            sx={{ margin: '10px', marginBottom: '30px', fontFamily: 'Poppins, sans-serif' }}
          >
            Save Changes
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSignout}
            className={classes.button}
            sx={{ margin: '10px', marginBottom: '30px', fontFamily: 'Poppins, sans-serif' }}
          >
            Sign Out
          </Button>
        </>
      ) : (
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          sx={{ margin: '10px', marginBottom: '30px', fontFamily: 'Poppins, sans-serif' }}
          onClick={() => navigate('/searchUser')}
        >
          Back to Users List
        </Button>
      )}
    </Container>
  );
}

export default AccountPage;
