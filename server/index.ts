import express from 'express';
import type { Server } from 'http';

const app = express();
const port = Number(process.env.PORT) || 3000;

let server: Server | null = null;

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export function startServer(): Promise<Server> {
  return new Promise((resolve, reject) => {
    if (server) {
      resolve(server);
      return;
    }

    server = app
      .listen(port, () => {
        console.log(`Server listening on http://localhost:${port}`);
        resolve(server!);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

export function stopServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }

    server.close((err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('Server stopped');
      server = null;
      resolve();
    });
  });
}

export { app };
