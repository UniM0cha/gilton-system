import { app, BrowserWindow } from 'electron';
import express from 'express';

const createWindow = () => {
  const win = new BrowserWindow({ width: 800, height: 600 });
  win.loadFile('index.html');
};

app.whenReady().then(createWindow);

const serverApp = express();
serverApp.get('/api/ping', (_req, res) => res.json({ status: 'ok' }));
serverApp.listen(3000, () => console.log('Server running'));
