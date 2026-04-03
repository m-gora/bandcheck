import * as React from 'react';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import ReviewsIcon from '@mui/icons-material/Reviews';
import InfoIcon from '@mui/icons-material/Info';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SideMenuMobileProps {
  open: boolean | undefined;
  toggleDrawer: (newOpen: boolean) => () => void;
}

export default function SideMenuMobile({ open, toggleDrawer }: Readonly<SideMenuMobileProps>) {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
    toggleDrawer(false)();
  };

  const handleLogin = () => {
    loginWithRedirect();
    toggleDrawer(false)();
  };

  const handleLogout = () => {
    logout();
    toggleDrawer(false)();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: 'none',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: '70dvw',
          height: '100%',
        }}
      >
        {/* Header */}
        <Stack sx={{ p: 3, pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            BandCheck
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Safe Music Discovery
          </Typography>
        </Stack>
        
        <Divider />

        {/* Navigation Items */}
        <List sx={{ flexGrow: 1, px: 1, py: 2 }}>
          <ListItem disablePadding>
            <ListItemButton 
              sx={{ borderRadius: 2 }}
              onClick={() => handleNavigation('/')}
            >
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton 
              sx={{ borderRadius: 2 }}
              onClick={() => handleNavigation('/discover')}
            >
              <ListItemIcon>
                <SearchIcon />
              </ListItemIcon>
              <ListItemText primary="Discover Bands" />
            </ListItemButton>
          </ListItem>
          
          {isAuthenticated && (
            <ListItem disablePadding>
              <ListItemButton 
                sx={{ borderRadius: 2 }}
                onClick={() => handleNavigation('/submit-artist')}
              >
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary="Submit Artist" />
              </ListItemButton>
            </ListItem>
          )}
          
          <ListItem disablePadding>
            <ListItemButton sx={{ borderRadius: 2 }}>
              <ListItemIcon>
                <ReviewsIcon />
              </ListItemIcon>
              <ListItemText primary="Reviews" />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton 
              sx={{ borderRadius: 2 }}
              onClick={() => handleNavigation('/about')}
            >
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" />
            </ListItemButton>
          </ListItem>
        </List>

        <Divider />

        {/* Auth Section */}
        <Stack sx={{ p: 2 }}>
          {!isLoading && (
            <>
              {isAuthenticated && user ? (
                <>
                  {/* User Profile Section */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={user.picture}
                      alt={user.name}
                      sx={{ width: 40, height: 40, mr: 2 }}
                    >
                      {user.name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* User Menu Items */}
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemButton sx={{ borderRadius: 2 }}>
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText primary="Profile" />
                    </ListItemButton>
                  </ListItem>
                  
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{ 
                      borderRadius: '12px',
                      textTransform: 'none',
                      py: 1.5,
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<LoginIcon />}
                  onClick={handleLogin}
                  sx={{ 
                    borderRadius: '12px',
                    textTransform: 'none',
                    py: 1.5,
                  }}
                >
                  Sign In
                </Button>
              )}
            </>
          )}
        </Stack>
      </Stack>
    </Drawer>
  );
}
