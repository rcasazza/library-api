import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { buildApp } from '../app.js';
import bcrypt from 'bcrypt';

const app = buildApp();

beforeAll(async () => {
  await app.ready();
  app.db.prepare('DELETE FROM users WHERE username = ?').run('newuser');
  app.db.prepare('DELETE FROM users WHERE username = ?').run('trimmeduser');
  app.db.prepare('DELETE FROM users WHERE username = ?').run('bademailuser');
  app.db.prepare('DELETE FROM users WHERE username = ?').run('weakpassuser');
});

afterAll(async () => {
  await app.close();
});

describe('/api/register route', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app.server).post('/api/register').send({
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'newpass123',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.username).toBe('newuser');
    expect(res.body.email).toBe('newuser@example.com');
    expect(res.body.role).toBe('user');
    expect(res.body.is_verified).toBe(false);
  });

  it('should reject duplicate username/email', async () => {
    const res = await request(app.server).post('/api/register').send({
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'securePass123',
    });

    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  it('should reject registration with missing fields', async () => {
    const res = await request(app.server).post('/api/register').send({
      username: '',
      email: '',
      password: '',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should reject registration with a weak password', async () => {
    const res = await request(app.server).post('/api/register').send({
      username: 'weakpassuser',
      email: 'weak@example.com',
      password: '123',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should reject registration with an invalid email format', async () => {
    const res = await request(app.server).post('/api/register').send({
      username: 'bademailuser',
      email: 'not-an-email',
      password: 'validpass123',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should trim username and email before registration', async () => {
    const res = await request(app.server).post('/api/register').send({
      username: '  trimmeduser  ',
      email: '  trimmed@example.com  ',
      password: 'validpass123',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.username).toBe('trimmeduser');
    expect(res.body.email).toBe('trimmed@example.com');
  });
});
