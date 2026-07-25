import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          apollo: ['@apollo/client'],
          vendor: ['react', 'react-dom']
        }
      }
    },
    chunkSizeWarningLimit: 100
  }
});