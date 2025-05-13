export default async function logoutRoutes(fastify) {
  fastify.post('/api/logout', {
    schema: {
      tags: ['Auth'],
      summary: 'Logout and revoke refresh token',
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { refreshToken } = request.body;

      try {
        const { jti } = await fastify.jwt.verify(refreshToken);
        fastify.tokenStore.revokeRefreshToken(jti);
      } catch {
        // intentionally ignore errors to always return success
      }

      return { success: true };
    },
  });
}
