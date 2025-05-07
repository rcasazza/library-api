// routes/login.js
export default async function loginRoutes(fastify) {
  fastify.post('/api/login', async (request, reply) => {
    const { userName, password } = request.body;

    if (userName === 'admin' && password === 'secret') {
      return {
        success: true,
        token: 'dummy-access',
        refreshToken: 'dummy-refresh',
      };
    }

    return reply.code(403).send({ success: false, message: 'Invalid credentials' });
  });
}
