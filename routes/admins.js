import { roleGuard } from '../lib/roleGuard.js';

export default async function adminRoutes(fastify) {
  await fastify.after(); // waits for plugins

  console.log('[adminRoutes] starting route setup');

  fastify.get('/api/admin', {
    preHandler: roleGuard('admin'),
    schema: {
      tags: ['Admin'],
      summary: 'Admin-only endpoint',
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        403: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      return { message: 'Welcome, admin!' };
    },
  });
}
