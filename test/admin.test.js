import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { buildApp } from '../app.js';
import bcrypt from 'bcrypt';

const app = buildApp();
await app.ready();

beforeAll(async () => {
  console.log('[test] app.requireRole =', typeof app.requireRole);

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

afterAll(async () => {
  await app.close();
});

describe('/api/admin route', () => {
  it('should allow access for admin user', async () => {
    const loginRes = await request(app.server)
      .post('/api/login')
      .send({ userName: 'admin', password: 'admin123' });

    const token = loginRes.body.accessToken;

    const res = await request(app.server)
      .get('/api/admin')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/admin/i);
  });

  it('should reject access for non-admin user', async () => {
    const loginRes = await request(app.server)
      .post('/api/login')
      .send({ userName: 'bob', password: 'user123' });

    const token = loginRes.body.accessToken;

    console.log('user token:', token);

    const res = await request(app.server)
      .get('/api/admin')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
  });
});
