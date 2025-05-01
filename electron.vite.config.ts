import { defineConfig } from 'electron-vite';
import path from 'path';

export default defineConfig({
  main: {
    build: {
      entry: 'electron/main.ts',
      outDir: 'dist/electron'
    }
  },
  preload: {
    build: {
      entry: undefined // No preload script in this project
    }
  },
  renderer: {
    root: '.',
    build: {
      input: {
        index: path.join(__dirname, 'index.html')
      },
      outDir: 'dist/client'
    }
  }
});
