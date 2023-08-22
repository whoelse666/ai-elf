import { fileURLToPath, URL } from 'node:url';

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode, command }) => {
  return {
    base: './',
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
    },
    build: {
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      emptyOutDir: true, // 每次构建时清除dist目录
      target: 'es2015',
      outDir: 'dist', // 输出文件的目录
      assetsInlineLimit: 4096, // 在生成的包中压缩文件的大小限制（以字节为单位）
      cssCodeSplit: true, // 是否将CSS拆分为更小的块并独立加载
      minify: 'terser', // 代码压缩方式
      sourcemap: false // 是否生成sourcemap文件
    }
  };
});
