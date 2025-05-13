import { createAccessToken, verifyRefreshToken } from '../lib/token.js';

export default async function refreshRoutes(fastify) {
  fastify.post('/api/refresh', {
    schema: {
      tags: ['Auth'],
      summary: 'Refresh access token',
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
            accessToken: { type: 'string' },
          },
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { refreshToken } = request.body;

      try {
        const payload = await verifyRefreshToken(request.server, refreshToken);
        const accessToken = await createAccessToken(request.server, {
          userName: payload.userName,
          role: payload.role,
        });

        return reply.send({ accessToken });
      } catch (err) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
    },
  });
}
