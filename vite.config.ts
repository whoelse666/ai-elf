import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    https: false,
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://10.1.75.208:8081/ai/api',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        javascriptEnabled: true
        // additionalData: '@import "./src/styles/variable.scss";',
      }
    }
  }
});
