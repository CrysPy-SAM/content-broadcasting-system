import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Frontend dev server runs on 5173, backend on 3000.
// We proxy API + /uploads so the same-origin assumption holds in dev.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:3000',
      '/content': 'http://localhost:3000',
      '/approval': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000',
      '/health': 'http://localhost:3000',
    },
  },
});
