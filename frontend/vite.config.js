import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This explicitly tells Vite to find and pre-bundle these packages,
  // which is a more robust fix for dependency resolution errors.
  optimizeDeps: {
    include: ['chart.js', 'react-chartjs-2'],
  },
});

