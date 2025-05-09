// routes/login.js
export default async function loginRoutes(fastify) {
  fastify.post('/api/login', async (request, reply) => {
    const { userName, password } = request.body;

    if (userName === 'admin' && password === 'secret') {
      const accessToken = fastify.jwt.sign(
        { userName },
        { expiresIn: '1m' } // xx-minute access token
      );

      const refreshToken = fastify.jwt.sign(
        { userName },
        { expiresIn: '7d' } // 7-day refresh token
      );

      return { accessToken, refreshToken };
    }

    return reply
      .code(403)
      .send({ success: false, message: 'Invalid credentials' });
  });
}
