import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const { isLoggedIn } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="sticky" sx={{ marginBottom: '16px' }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMenu}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, fontFamily: 'Poppins, sans-serif' }}>
          Starplanet
        </Typography>
        {!isMobile && (
          <>
            <Button color="inherit" component={Link} to="/" sx={{ fontFamily: 'Poppins, sans-serif' }}>Home</Button>
            <Button color="inherit" component={Link} to="/searchMedia" sx={{ fontFamily: 'Poppins, sans-serif' }}>Search Media</Button>
            <Button color="inherit" component={Link} to="/searchUser" sx={{ fontFamily: 'Poppins, sans-serif' }}>Search User</Button>
            <Button color="inherit" component={Link} to="/popularMovies" sx={{ fontFamily: 'Poppins, sans-serif' }}>Popular Movies</Button>
            <Button color="inherit" component={Link} to="/popularSeries" sx={{ fontFamily: 'Poppins, sans-serif' }}>Popular Series</Button>
            <Button color="inherit" component={Link} to={isLoggedIn ? "/account/0" : "/signin"} sx={{ fontFamily: 'Poppins, sans-serif' }}>Account</Button>
          </>
        )}
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose} component={Link} to="/" sx={{ fontFamily: 'Poppins, sans-serif' }}>Home</MenuItem>
          <MenuItem onClick={handleClose} component={Link} to="/searchMedia" sx={{ fontFamily: 'Poppins, sans-serif' }}>Search Media</MenuItem>
          <MenuItem onClick={handleClose} component={Link} to="/searchUser" sx={{ fontFamily: 'Poppins, sans-serif' }}>Search User</MenuItem>
          <MenuItem onClick={handleClose} component={Link} to="/popularMovies" sx={{ fontFamily: 'Poppins, sans-serif' }}>Popular Movies</MenuItem>
          <MenuItem onClick={handleClose} component={Link} to="/popularSeries" sx={{ fontFamily: 'Poppins, sans-serif' }}>Popular Series</MenuItem>
          <MenuItem onClick={handleClose} component={Link} to={isLoggedIn ? "/account/0" : "/signin"} sx={{ fontFamily: 'Poppins, sans-serif' }}>Account</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
