import * as React from 'react';
import { useColorScheme } from '@mui/material/styles';
import { Box, IconButton, Tooltip, styled } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';

const ToggleContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  background: theme.palette.background.paper,
  borderRadius: '12px',
  border: `1px solid ${theme.palette.divider}`,
  padding: '4px',
  position: 'relative',
  overflow: 'hidden',
  gap: '2px',
}));

const ToggleButton = styled(IconButton)<{ active?: boolean }>(({ theme, active }) => ({
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  color: active ? 'white' : theme.palette.text.secondary,
  background: active ? theme.palette.primary.main : 'transparent',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    background: active 
      ? theme.palette.primary.dark 
      : theme.palette.action.hover,
    transform: active ? 'none' : 'scale(1.05)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '18px',
  },
}));

export default function ThemeToggle() {
  const { mode, setMode } = useColorScheme();

  if (!mode) {
    return null;
  }

  const handleModeChange = (newMode: 'system' | 'light' | 'dark') => {
    setMode(newMode);
  };

  return (
    <ToggleContainer>
      <Tooltip title="Light mode">
        <ToggleButton
          active={mode === 'light'}
          onClick={() => handleModeChange('light')}
          size="small"
        >
          <LightModeIcon />
        </ToggleButton>
      </Tooltip>
      
      <Tooltip title="System preference">
        <ToggleButton
          active={mode === 'system'}
          onClick={() => handleModeChange('system')}
          size="small"
        >
          <SettingsBrightnessIcon />
        </ToggleButton>
      </Tooltip>
      
      <Tooltip title="Dark mode">
        <ToggleButton
          active={mode === 'dark'}
          onClick={() => handleModeChange('dark')}
          size="small"
        >
          <DarkModeIcon />
        </ToggleButton>
      </Tooltip>
    </ToggleContainer>
  );
}