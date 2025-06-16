import { app, BrowserWindow } from 'electron';
import express from 'express';
import { WebSocketServer } from 'ws';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

const createWindow = () => {
  const win = new BrowserWindow({ width: 800, height: 600 });
  win.loadURL(`${VITE_DEV_SERVER_URL}/admin`);
};

app.whenReady().then(createWindow);

const upload = multer({ dest: path.join(__dirname, '../scores') });
const serverApp = express();
serverApp.use(express.json());
serverApp.use('/scores', express.static(path.join(__dirname, '../scores')));

serverApp.get('/api/ping', (_req, res) => res.json({ status: 'ok' }));

serverApp.get('/api/scores', (_req, res) => {
  const dir = path.join(__dirname, '../scores');
  fs.promises.readdir(dir).then(files => res.json(files));
});

serverApp.post('/api/scores', upload.array('files'), (_req, res) => {
  res.json({ ok: true });
});

serverApp.post('/api/command', (req, res) => {
  const msg = JSON.stringify({ type: 'command', payload: req.body.command });
  wss.clients.forEach(c => c.send(msg));
  res.json({ ok: true });
});

const httpServer = serverApp.listen(3000, () => console.log('Server running'));

const wss = new WebSocketServer({ server: httpServer });
wss.on('connection', ws => {
  ws.on('message', data => {
    wss.clients.forEach(c => c.send(data));
  });
});
