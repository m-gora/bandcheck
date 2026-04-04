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
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
          'auth-vendor': ['@auth0/auth0-react'],
        },
      },
    },
    // Speed up build with esbuild
    minify: 'esbuild',
    // Reduce source map generation time
    sourcemap: false,
  },
});
