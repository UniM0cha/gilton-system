import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { WebSocketServer } from 'ws';
import WebSocket from 'ws';

let wss: WebSocketServer;

beforeEach(() => {
  wss = new WebSocketServer({ port: 0 });
});

afterEach(() => {
  wss.close();
});

describe('ws broadcast', () => {
  it('should broadcast messages', done => {
    const port = (wss.address() as any).port;
    const a = new WebSocket(`ws://localhost:${port}`);
    const b = new WebSocket(`ws://localhost:${port}`);
    b.on('message', msg => {
      expect(msg.toString()).toBe('ping');
      a.close();
      b.close();
      done();
    });
    a.on('open', () => {
      a.send('ping');
    });
    wss.on('connection', ws => {
      ws.on('message', data => wss.clients.forEach(c => c.send(data)));
    });
  });
});
