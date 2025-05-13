import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../app.js';
import bcrypt from 'bcrypt';

let app;

beforeAll(async () => {
  app = await buildApp();

  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  app.db
    .prepare(
      `
    INSERT OR IGNORE INTO users (username, password, email, role, is_verified)
    VALUES (?, ?, ?, ?, ?)
  `
    )
    .run('admin', adminPassword, 'admin@example.com', 'admin', 1);

  app.db
    .prepare(
      `
    INSERT OR IGNORE INTO users (username, password, email, role, is_verified)
    VALUES (?, ?, ?, ?, ?)
  `
    )
    .run('bob', userPassword, 'bob@example.com', 'user', 1);
});

afterAll(() => {
  app.db.close();
});

describe('/api/admin route', () => {
  it('should allow access for admin user', async () => {
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/login',
      payload: { userName: 'admin', password: 'admin123' },
    });

    const token = loginRes.json().accessToken;

    const res = await app.inject({
      method: 'GET',
      url: '/api/admin',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().message).toMatch(/admin/i);
  });

  it('should reject access for non-admin user', async () => {
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/login',
      payload: { userName: 'bob', password: 'user123' },
    });

    const token = loginRes.json().accessToken;

    const res = await app.inject({
      method: 'GET',
      url: '/api/admin',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.statusCode).toBe(403);
  });
});
