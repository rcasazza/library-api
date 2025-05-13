import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { buildApp } from '../app.js';
import bcrypt from 'bcrypt';

let app;

beforeAll(async () => {
  app = await buildApp();

  const hashedPassword = await bcrypt.hash('secret', 10);
  app.db
    .prepare(
      `
    INSERT OR IGNORE INTO users (username, password, email, role, is_verified)
    VALUES (?, ?, ?, ?, ?)
  `
    )
    .run('testuser', hashedPassword, 'test@example.com', 'user', 1);
});

afterAll(() => {
  app.db.close();
});

describe('Library API', () => {
  it('should login successfully with correct credentials', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/login',
      payload: { userName: 'testuser', password: 'secret' },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('accessToken');
    expect(res.json()).toHaveProperty('refreshToken');
  });

  it('should reject access to /api/books without token', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/books',
    });

    expect(res.statusCode).toBe(401);
  });

  it('should return books with valid token', async () => {
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/login',
      payload: { userName: 'testuser', password: 'secret' },
    });

    const accessToken = loginRes.json().accessToken;

    const res = await app.inject({
      method: 'GET',
      url: '/api/books',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.json())).toBe(true);
  });
});
