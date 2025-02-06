import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT || 3000, // ✅ Usa correctamente process.env.PORT
    host: true,
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
