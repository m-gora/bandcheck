import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import AppTheme from './styles/Theme';
import { CssBaseline } from '@mui/material';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppTheme>
      <CssBaseline />
      <App />
    </AppTheme>
  </React.StrictMode>,
);
