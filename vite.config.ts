import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['events', 'stream', 'util'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5286',
        changeOrigin: true,
        secure: false,
      },
      '/videoHub': {
        target: 'http://localhost:5286',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});