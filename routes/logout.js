// routes/logout.js
import { revokeRefreshToken } from '../lib/tokenStore.js';

export default async function logoutRoutes(fastify) {
  fastify.post('/api/logout', async (request, reply) => {
    const { refreshToken } = request.body;

    if (!refreshToken) {
      return reply.send({ success: true }); // treat missing as "already logged out"
    }

    try {
      const decoded = fastify.jwt.verify(refreshToken);
      if (decoded.jti) {
        fastify.tokenStore.revokeRefreshToken(decoded.jti);
      }
    } catch (err) {
      // Swallow the error — even invalid tokens result in 200
    }

    const accessToken = request.headers.authorization?.split(' ')[1];
    if (accessToken) {
      fastify.tokenBlacklist.revokeAccessToken(accessToken);
    }

    return reply.send({ success: true });
  });
}
