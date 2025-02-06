import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.DATABASE_URL || 3000, // Usa el puerto definido por Railway
    host: true, // Asegura que el servidor acepte conexiones externas
  },
  build: {
    outDir: 'dist', // Asegura que los archivos se generen en dist
    sourcemap: true, // Opcional: útil para depuración
  },
  preview: {
    port: 3000, // Ajusta para coincidir con Railway
    host: true, 
  }
});
