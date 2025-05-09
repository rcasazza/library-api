import { describe, it, afterAll, beforeAll, expect } from 'vitest';
import request from 'supertest';
import { buildApp } from '../app.js';

const app = buildApp();

beforeAll(async () => {
  await app.ready(); // ✅ wait until Fastify is fully initialized
});

afterAll(async () => {
  await app.close(); // ✅ clean up the Fastify server after tests
});

describe('Library API', () => {
  it('should login successfully with correct credentials', async () => {
    const res = await request(app.server)
      .post('/api/login')
      .send({ userName: 'admin', password: 'secret' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('should reject access to /api/books without token', async () => {
    const res = await request(app.server).get('/api/books');
    expect(res.statusCode).toBe(401);
  });

  it('should return books with valid token', async () => {
    // 🔑 First, login to get a real JWT
    const loginRes = await request(app.server)
      .post('/api/login')
      .send({ userName: 'admin', password: 'secret' });

    const accessToken = loginRes.body.accessToken;

    // 🧪 Use the token to access the protected route
    const res = await request(app.server)
      .get('/api/books')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
