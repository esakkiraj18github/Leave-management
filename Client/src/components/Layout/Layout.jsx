import { Box, Toolbar } from '@mui/material';
import { useState, useMemo } from 'react';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const mainPadding = useMemo(
    () => ({ xs: 2, sm: 3, lg: 4 }),
    []
  );

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar onMenuClick={handleDrawerToggle} />
      <Sidebar
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          ml: { xs: 0, md: `${drawerWidth}px` },
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        <Box
          sx={{
            flexGrow: 1,
            px: mainPadding,
            pb: 4,
            pt: { xs: 2, sm: 3 },
            width: '100%',
            maxWidth: '1600px',
            mx: 'auto'
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;

