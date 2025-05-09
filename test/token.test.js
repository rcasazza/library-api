import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';
import { buildApp } from '../app.js';
import {
  createUserTokens,
  createAccessToken,
  createRefreshToken,
  injectWithToken,
  expire,
} from './helpers/token.js';
import { revokeAccessToken } from './lib/tokenBlackList.js';
import { storeRefreshToken, revokeRefreshToken } from '../lib/tokenStore.js';
import { v4 as uuidv4 } from 'uuid';

const app = buildApp();

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('JWT Expiration and Refresh', () => {
  it('should return 401 for expired access token', async () => {
    const expiredToken = createAccessToken(app, undefined, { expiresIn: '1s' });
    await expire(1500);

    const res = await injectWithToken(app, 'get', '/api/books', expiredToken);
    expect(res.statusCode).toBe(401);
  });

  it('should issue new access token using valid refresh token', async () => {
    const jti = uuidv4();
    const refreshToken = createRefreshToken(app, { userName: 'admin', jti });
    storeRefreshToken(jti, refreshToken);

    const res = await request(app.server)
      .post('/api/refresh')
      .send({ refreshToken });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('should reject refresh if token is revoked', async () => {
    const jti = uuidv4();
    const refreshToken = createRefreshToken(app, { userName: 'admin', jti });
    storeRefreshToken(jti, refreshToken);
    revokeRefreshToken(jti); // immediately revoke

    const res = await request(app.server)
      .post('/api/refresh')
      .send({ refreshToken });

    expect(res.statusCode).toBe(401);
  });

  it('should return books with valid token', async () => {
    const { accessToken } = createUserTokens(app);
    const res = await injectWithToken(app, 'get', '/api/books', accessToken);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
it('should revoke refresh token on logout', async () => {
  const jti = uuidv4();
  const refreshToken = createRefreshToken(app, { userName: 'admin', jti });
  storeRefreshToken(jti, refreshToken);

  // Logout with refresh token
  const logoutRes = await request(app.server)
    .post('/api/logout')
    .send({ refreshToken });

  expect(logoutRes.statusCode).toBe(200);
  expect(logoutRes.body).toEqual({ success: true });

  // Try to use the same refresh token again
  const refreshRes = await request(app.server)
    .post('/api/refresh')
    .send({ refreshToken });

  expect(refreshRes.statusCode).toBe(401);
});
it('should reject blacklisted access token on protected route', async () => {
  const token = createAccessToken(app, undefined, { expiresIn: '15m' });

  app.tokenBlacklist.revokeAccessToken(token); // ✅ shared token blacklist

  const res = await request(app.server)
    .get('/api/books')
    .set('Authorization', `Bearer ${token}`);

  expect(res.statusCode).toBe(401);
});

it('should reject login with invalid credentials', async () => {
  const res = await request(app.server)
    .post('/api/login')
    .send({ userName: 'wrong', password: 'nope' });

  expect(res.statusCode).toBe(403);
});

it('should reject refresh token without jti', async () => {
  const badRefreshToken = app.jwt.sign(
    { userName: 'admin' },
    { expiresIn: '7d' }
  );

  const res = await request(app.server)
    .post('/api/refresh')
    .send({ refreshToken: badRefreshToken });

  expect(res.statusCode).toBe(401);
});

it('should handle logout with invalid token gracefully', async () => {
  const res = await request(app.server)
    .post('/api/logout')
    .send({ refreshToken: 'invalid.token.value' });

  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({ success: true });
});

it('should reject expired refresh token', async () => {
  const jti = uuidv4();
  const refreshToken = createRefreshToken(
    app,
    { userName: 'admin', jti },
    { expiresIn: '1s' }
  );
  app.tokenStore.storeRefreshToken(jti, refreshToken);

  await expire(1500);

  const res = await request(app.server)
    .post('/api/refresh')
    .send({ refreshToken });

  expect(res.statusCode).toBe(401);
});
