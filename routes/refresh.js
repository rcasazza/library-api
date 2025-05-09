export default async function refreshRoutes(fastify) {
  fastify.post('/api/refresh', async (request, reply) => {
    const { refreshToken } = request.body;

    if (!refreshToken) {
      return reply.code(400).send({ error: 'Refresh token required' });
    }

    try {
      const decoded = fastify.jwt.verify(refreshToken);
      const newAccessToken = fastify.jwt.sign(
        { userName: decoded.userName },
        { expiresIn: '15m' }
      );
      return { accessToken: newAccessToken };
    } catch (err) {
      return reply
        .code(401)
        .send({ error: 'Invalid or expired refresh token' });
    }
  });
}
