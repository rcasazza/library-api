export default async function adminRoutes(fastify) {
  await fastify.after(); // waits for plugins

  console.log('[adminRoutes] starting route setup');

  fastify.get('/api/admin', {
    preHandler: async (request, reply) => {
      try {
        request.requireRole('admin'); // 👈 cleaner, instance-safe
      } catch (err) {
        return reply.code(403).send({ error: err.message });
      }
    },
    handler: async (request, reply) => {
      return { message: 'Welcome, admin!' };
    },
  });
}
