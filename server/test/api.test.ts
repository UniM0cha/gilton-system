import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';

const app = express();
app.get('/api/ping', (_req, res) => res.json({ status: 'ok' }));

describe('api', () => {
  it('/api/ping works', async () => {
    const res = await request(app).get('/api/ping');
    expect(res.body.status).toBe('ok');
  });
});
