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

  it('should issue new access token using refresh token', async () => {
    const refreshToken = createRefreshToken(app);

    const res = await request(app.server)
      .post('/api/refresh')
      .send({ refreshToken });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('should reject invalid refresh token', async () => {
    const res = await request(app.server)
      .post('/api/refresh')
      .send({ refreshToken: 'tampered.token.string' });

    expect(res.statusCode).toBe(401);
  });

  it('should return books with valid token', async () => {
    const { accessToken } = createUserTokens(app);
    const res = await injectWithToken(app, 'get', '/api/books', accessToken);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
