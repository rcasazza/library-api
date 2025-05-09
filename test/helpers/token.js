// test/helpers/token.js
import request from 'supertest';

export function createAccessToken(
  app,
  payload = { userName: 'admin' },
  opts = {}
) {
  return app.jwt.sign(payload, { expiresIn: '15m', ...opts });
}

export function createRefreshToken(
  app,
  payload = { userName: 'admin' },
  opts = {}
) {
  return app.jwt.sign(payload, { expiresIn: '7d', ...opts });
}

export function createUserTokens(app, userName = 'admin') {
  const payload = { userName };
  return {
    accessToken: createAccessToken(app, payload),
    refreshToken: createRefreshToken(app, payload),
  };
}

export async function expire(ms = 1500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function injectWithToken(app, method, url, token) {
  return request(app.server)
    [method](url)
    .set('Authorization', `Bearer ${token}`);
}
