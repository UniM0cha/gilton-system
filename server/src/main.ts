import { app, BrowserWindow } from 'electron';
import express from 'express';

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

const createWindow = () => {
  const win = new BrowserWindow({ width: 800, height: 600 });
  win.loadURL(`${VITE_DEV_SERVER_URL}/admin`);
};

app.whenReady().then(createWindow);

const serverApp = express();
serverApp.get('/api/ping', (_req, res) => res.json({ status: 'ok' }));
serverApp.listen(3000, () => console.log('Server running'));
