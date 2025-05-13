import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../app.js';

let app;

beforeAll(async () => {
  app = await buildApp();

  app.db.prepare('DELETE FROM users WHERE username = ?').run('newuser');
  app.db.prepare('DELETE FROM users WHERE username = ?').run('trimmeduser');
  app.db.prepare('DELETE FROM users WHERE username = ?').run('bademailuser');
  app.db.prepare('DELETE FROM users WHERE username = ?').run('weakpassuser');
});

afterAll(() => {
  try {
    app.db.close();
    console.log('[test] db closed');
  } catch (err) {
    console.error('[test] db.close failed:', err);
  }
});

describe('/api/register route', () => {
  it('should register a new user successfully', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/register',
      payload: {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'newpass123',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body).toHaveProperty('id');
    expect(body.username).toBe('newuser');
    expect(body.email).toBe('newuser@example.com');
    expect(body.role).toBe('user');
    expect(body.is_verified).toBe(false);
  });

  it('should reject duplicate username/email', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/register',
      payload: {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'securePass123',
      },
    });

    expect(res.statusCode).toBe(409);
    expect(res.json()).toHaveProperty('error');
  });

  it('should reject registration with missing fields', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/register',
      payload: {
        username: '',
        email: '',
        password: '',
      },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json()).toHaveProperty('error');
  });

  it('should reject registration with a weak password', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/register',
      payload: {
        username: 'weakpassuser',
        email: 'weak@example.com',
        password: '123',
      },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json()).toHaveProperty('error');
  });

  it('should reject registration with an invalid email format', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/register',
      payload: {
        username: 'bademailuser',
        email: 'not-an-email',
        password: 'validpass123',
      },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json()).toHaveProperty('error');
  });

  it('should trim username and email before registration', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/register',
      payload: {
        username: '  trimmeduser  ',
        email: '  trimmed@example.com  ',
        password: 'validpass123',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.username).toBe('trimmeduser');
    expect(body.email).toBe('trimmed@example.com');
  });
});
