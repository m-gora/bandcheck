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
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import ReviewsIcon from '@mui/icons-material/Reviews';
import InfoIcon from '@mui/icons-material/Info';
import LoginIcon from '@mui/icons-material/Login';
import MenuButton from './MenuButton';

interface SideMenuMobileProps {
  open: boolean | undefined;
  toggleDrawer: (newOpen: boolean) => () => void;
}

export default function SideMenuMobile({ open, toggleDrawer }: Readonly<SideMenuMobileProps>) {
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
            <ListItemButton sx={{ borderRadius: 2 }}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton sx={{ borderRadius: 2 }}>
              <ListItemIcon>
                <SearchIcon />
              </ListItemIcon>
              <ListItemText primary="Discover Bands" />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton sx={{ borderRadius: 2 }}>
              <ListItemIcon>
                <ReviewsIcon />
              </ListItemIcon>
              <ListItemText primary="Reviews" />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton sx={{ borderRadius: 2 }}>
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" />
            </ListItemButton>
          </ListItem>
        </List>

        <Divider />

        {/* Sign In Button */}
        <Stack sx={{ p: 2 }}>
          <Button 
            variant="contained" 
            fullWidth 
            startIcon={<LoginIcon />}
            sx={{ 
              borderRadius: '12px',
              textTransform: 'none',
              py: 1.5,
            }}
          >
            Sign In
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}
