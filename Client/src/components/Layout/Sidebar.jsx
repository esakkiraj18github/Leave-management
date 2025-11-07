import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Toolbar,
  Divider
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ApprovalIcon from '@mui/icons-material/Approval';

const MOBILE_APPBAR_HEIGHT = 56;
const DESKTOP_APPBAR_HEIGHT = 64;

const Sidebar = ({ drawerWidth = 240, mobileOpen, onDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isEmployee } = useAuth();

  const menuItems = useMemo(() => {
    const items = [];

    if (isEmployee) {
      items.push(
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/employee/dashboard' },
        { text: 'Apply Leave', icon: <AddCircleIcon />, path: '/employee/apply-leave' },
        { text: 'My Leaves', icon: <AssignmentIcon />, path: '/employee/my-leaves' }
      );
    }

    if (isAdmin) {
      items.push(
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
        { text: 'Leave Approval', icon: <ApprovalIcon />, path: '/admin/leave-approval' }
      );
    }

    return items;
  }, [isAdmin, isEmployee]);

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Toolbar sx={{ minHeight: { xs: MOBILE_APPBAR_HEIGHT, sm: DESKTOP_APPBAR_HEIGHT } }} />
      </Box>
      <Divider />
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => {
            const selected = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={selected}
                  onClick={() => {
                    navigate(item.path);
                    if (onDrawerToggle) {
                      onDrawerToggle();
                    }
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ fontSize: '0.95rem' }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth
          }
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            top: `${DESKTOP_APPBAR_HEIGHT}px`,
            height: `calc(100% - ${DESKTOP_APPBAR_HEIGHT}px)`
          }
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;

