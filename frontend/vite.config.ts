import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: "/",
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: true,   // hiện Network URL (địa chỉ IP LAN) khi chạy npm run dev
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Proxy toan bo /api/* sang backend C++ (Crow) dang chay o port 8080,
      // de tranh loi CORS khi goi fetch("/api/...") tu trinh duyet luc dev.
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
        // Proxy WebSocket "/ws" sang backend C++ (real-time so do ghe + thong bao
        // Admin). Co "ws: true" la bat buoc de Vite chuyen tiep dung giao thuc
        // WebSocket thay vi xu ly nhu HTTP thuong.
        '/ws': {
          target: 'ws://localhost:8080',
          ws: true,
        },
      },
    },
  };
});
