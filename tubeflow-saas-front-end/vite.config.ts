import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    allowedHosts: ['tubeflow10x.com'],  // Permitir o domínio
    host: '0.0.0.0',  // Isso faz o servidor aceitar conexões de qualquer IP
    port: 3102,  // Certifique-se de que a porta está correta
  },
});
