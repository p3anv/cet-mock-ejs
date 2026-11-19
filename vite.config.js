import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        test: resolve(__dirname, 'test.html')
      }
    }
  },
  server: {
    port: 5500,
    open: true
  }
});