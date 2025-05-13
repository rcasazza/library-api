import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../app.js';
import bcrypt from 'bcrypt';
import { createAccessToken, createRefreshToken } from '../lib/token.js';

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

describe('Token API', () => {
  it('should refresh token with valid refresh token', async () => {
    const refreshToken = await createRefreshToken(app, {
      userName: 'testuser',
      role: 'user',
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/refresh',
      payload: { refreshToken },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('accessToken');
  });

  it('should reject refresh with invalid token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/refresh',
      payload: { refreshToken: 'invalid' },
    });

    expect(res.statusCode).toBe(401);
  });

  it('should reject blacklisted access token on protected route', async () => {
    const token = createAccessToken(
      app,
      { userName: 'testuser', role: 'user' },
      { expiresIn: '15m' }
    );

    app.tokenBlacklist.revokeAccessToken(token);

    const res = await app.inject({
      method: 'GET',
      url: '/api/books',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.statusCode).toBe(401);
  });

  it('should logout and invalidate refresh token', async () => {
    const refreshToken = await createRefreshToken(app, {
      userName: 'testuser',
      role: 'user',
    });

    const logoutRes = await app.inject({
      method: 'POST',
      url: '/api/logout',
      payload: { refreshToken },
    });

    expect(logoutRes.statusCode).toBe(200);
    expect(logoutRes.json()).toEqual({ success: true });

    const refreshRes = await app.inject({
      method: 'POST',
      url: '/api/refresh',
      payload: { refreshToken },
    });

    expect(refreshRes.statusCode).toBe(401);
  });
});
