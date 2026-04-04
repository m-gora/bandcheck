/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
  },
  build: {
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
    // Optimize dependencies
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'react-vendor';
          }
          if (id.includes('@mui/material') || id.includes('@mui/icons-material')) {
            return 'mui-vendor';
          }
          if (id.includes('@auth0/auth0-react')) {
            return 'auth-vendor';
          }
        },
      },
    },
    // Speed up build with esbuild
    minify: 'esbuild',
    // Reduce source map generation time
    sourcemap: false,
  },
});
