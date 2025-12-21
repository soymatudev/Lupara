import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'frontend',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'frontend/index.html'),
        auth: resolve(__dirname, 'frontend/views/auth/index.html'),
        forgot_password: resolve(__dirname, 'frontend/views/forgot-password/index.html'),
        health: resolve(__dirname, 'frontend/views/health/index.html'),
        home: resolve(__dirname, 'frontend/views/home/index.html'),
        mis_reservas: resolve(__dirname, 'frontend/views/profile/mis-reservas.html'),
        register: resolve(__dirname, 'frontend/views/register/index.html'),
        details: resolve(__dirname, 'frontend/views/reserva/details.html'),
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/assets': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
