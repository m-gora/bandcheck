import * as React from 'react';
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MuiToolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ShieldIcon from '@mui/icons-material/Shield';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SideMenuMobile from './SideMenuMobile';
import MenuButton from './MenuButton';
import ThemeToggle from '../ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


const Toolbar = styled(MuiToolbar)({
  width: '100%',
  padding: '12px 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
});

const AppNavBar = () => {
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth();

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{

        boxShadow: 0,
        bgcolor: 'background.paper',
        backgroundImage: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider',
        top: 'var(--template-frame-height, 0px)',
      }}
    >
      <Toolbar variant="regular">
        {/* Logo and Brand */}
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <CustomIcon />
          <Typography variant="h5" component="h1" sx={{ 
            color: 'text.primary',
            fontWeight: 'bold',
            display: { xs: 'none', sm: 'block' }
          }}>
            BandCheck
          </Typography>
        </Stack>

        {/* Desktop Navigation - Hidden on mobile */}
        <Stack 
          direction="row" 
          spacing={1}
          sx={{ 
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
          }}
        >
          <Button
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{ 
              color: 'text.primary',
              textTransform: 'none',
              fontSize: '0.95rem',
            }}
          >
            Home
          </Button>
          <Button
            startIcon={<SearchIcon />}
            onClick={() => navigate('/discover')}
            sx={{ 
              color: 'text.primary',
              textTransform: 'none',
              fontSize: '0.95rem',
            }}
          >
            Discover
          </Button>
          {isAuthenticated && (
            <Button
              onClick={() => navigate('/submit-artist')}
              sx={{ 
                color: 'text.primary',
                textTransform: 'none',
                fontSize: '0.95rem',
              }}
            >
              Submit Artist
            </Button>
          )}
          <Button
            sx={{ 
              color: 'text.primary',
              textTransform: 'none',
              fontSize: '0.95rem',
            }}
          >
            About
          </Button>
        </Stack>

        {/* Right side controls */}
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <ThemeToggle />
          
          {/* Desktop Auth Controls */}
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                  <Button
                    onClick={handleUserMenuClick}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '12px',
                      px: 2,
                      color: 'text.primary',
                    }}
                    startIcon={
                      <Avatar
                        src={user?.picture}
                        alt={user?.name}
                        sx={{ width: 24, height: 24 }}
                      >
                        {user?.name?.charAt(0)}
                      </Avatar>
                    }
                  >
                    {user?.name}
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleUserMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <MenuItem onClick={handleUserMenuClose}>
                      <ListItemIcon>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      Profile
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      Logout
                    </MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<LoginIcon />}
                  onClick={() => loginWithRedirect()}
                  sx={{ 
                    display: { xs: 'none', md: 'flex' },
                    textTransform: 'none',
                    borderRadius: '12px',
                    px: 3,
                  }}
                >
                  Sign In
                </Button>
              )}
            </>
          )}

          {/* Mobile Menu Button */}
          <MenuButton 
            aria-label="menu" 
            onClick={toggleDrawer(true)}
            sx={{ display: { xs: 'block', md: 'none' } }}
          >
            <MenuRoundedIcon />
          </MenuButton>
        </Stack>

        {/* Mobile Side Menu */}
        <SideMenuMobile open={open} toggleDrawer={toggleDrawer} />
      </Toolbar>
    </AppBar>
  );

}

const CustomIcon = () => {
  return (
    <Box
      sx={{
        width: '2rem',
        height: '2rem',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: 'linear-gradient(135deg, hsl(273, 91.6%, 58%) 0%, hsl(290, 85%, 65%) 100%)',
        color: 'white',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <ShieldIcon sx={{ fontSize: '1.2rem' }} />
    </Box>
  );
}

export default AppNavBar;
export { CustomIcon };
