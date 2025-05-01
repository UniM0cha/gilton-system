import { defineConfig } from 'electron-vite';
import path from 'path';

export default defineConfig({
  main: {
    build: {
      entry: path.resolve(__dirname, 'electron/main.ts'),
      outDir: 'dist/electron'
    }
  },
  preload: {
    build: {
      entry: null // No preload script in this project
    }
  },
  renderer: {
    build: {
      outDir: 'dist/client'
    }
  }
});
