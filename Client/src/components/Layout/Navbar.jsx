import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = ({ onMenuClick = () => {} }) => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="fixed" color="primary" elevation={1}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {isAuthenticated && (
          <IconButton
            color="inherit"
            edge="start"
            sx={{ display: { md: 'none' } }}
            onClick={onMenuClick}
            aria-label="open navigation menu"
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
        >
          Leave Management System
        </Typography>
        {user && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1.5, sm: 2 },
              flexWrap: 'wrap',
              justifyContent: 'flex-end'
            }}
          >
            <Typography
              variant="body2"
              sx={{
                display: { xs: 'none', sm: 'block' },
                fontWeight: 500
              }}
            >
              {user.name} ({user.role === 'admin' ? 'Admin' : 'Employee'})
            </Typography>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              size="small"
              sx={{ whiteSpace: 'nowrap' }}
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

