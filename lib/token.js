import { SignJWT, jwtVerify } from 'jose';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET;
const secret = new TextEncoder().encode(JWT_SECRET);

const REFRESH_EXPIRES_IN = 60 * 60 * 24 * 7; // 7 days in seconds
const ACCESS_EXPIRES_IN = 60 * 15; // 15 minutes in seconds

export async function createAccessToken(app, payload, options = {}) {
  const jti = uuidv4();
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${ACCESS_EXPIRES_IN}s`)
    .setJti(jti)
    .sign(secret);

  return token;
}

export async function createRefreshToken(app, payload) {
  const jti = uuidv4();
  const token = await new SignJWT({ ...payload, jti })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${REFRESH_EXPIRES_IN}s`)
    .sign(secret);

  app.tokenStore.storeRefreshToken(jti, payload.userName);
  return token;
}

export async function verifyRefreshToken(app, token) {
  try {
    const { payload } = await jwtVerify(token, secret);

    const { jti, userName } = payload;

    if (
      !jti ||
      !userName ||
      !app.tokenStore.isRefreshTokenValid(jti, userName)
    ) {
      throw new Error('Invalid or expired refresh token');
    }

    return payload;
  } catch (err) {
    throw new Error('Unauthorized');
  }
}
