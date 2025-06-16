import { describe, it, expect } from 'vitest';
import { routes } from './router';

describe('router 설정', () => {
  it('/admin 경로가 포함되어야 한다', () => {
    expect(routes.some(r => r.path === '/admin')).toBe(true);
  });
  it('/worship 경로가 포함되어야 한다', () => {
    expect(routes.some(r => r.path === '/worship')).toBe(true);
  });
});
