import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        test: resolve(import.meta.dirname, 'test.html')
      }
    }
  },
  server: {
    port: 5500,
    open: true
  }
});