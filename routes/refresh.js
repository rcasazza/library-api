import {
  isRefreshTokenValid,
  storeRefreshToken,
  revokeRefreshToken,
} from '../lib/tokenStore.js';
import { v4 as uuidv4 } from 'uuid';

export default async function refreshRoutes(fastify) {
  fastify.post('/api/refresh', async (request, reply) => {
    const { refreshToken } = request.body;

    if (!refreshToken) {
      return reply.code(400).send({ error: 'Refresh token required' });
    }

    try {
      const decoded = fastify.jwt.verify(refreshToken);
      const { userName, jti } = decoded;

      if (!jti || !fastify.tokenStore.isRefreshTokenValid(jti)) {
        return reply
          .code(401)
          .send({ error: 'Invalid or revoked refresh token' });
      }

      // Revoke old refresh token
      revokeRefreshToken(jti);

      // Issue new tokens
      const newAccessToken = fastify.jwt.sign(
        { userName },
        { expiresIn: '15m' }
      );

      const newJti = uuidv4();
      const newRefreshToken = fastify.jwt.sign(
        { userName, jti: newJti },
        { expiresIn: '7d' }
      );
      storeRefreshToken(newJti, newRefreshToken);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
      return reply
        .code(401)
        .send({ error: 'Invalid or expired refresh token' });
    }
  });
}
