import bcrypt from 'bcrypt';

export default async function loginRoutes(fastify) {
  fastify.post('/api/login', async (request, reply) => {
    const { userName, password } = request.body;

    const user = fastify.db
      .prepare('SELECT * FROM users WHERE username = ?')
      .get(userName);

    if (!user) {
      console.log('User not found:', userName);
      return reply.code(403).send({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.code(403).send({ error: 'Invalid credentials' });
    }

    const accessToken = fastify.jwt.sign(
      { userName: user.username, role: user.role },
      { expiresIn: '15m' }
    );

    const refreshToken = fastify.jwt.sign(
      { userName: user.username, role: user.role, jti: crypto.randomUUID() },
      { expiresIn: '7d' }
    );

    fastify.tokenStore.storeRefreshToken(user.jti, refreshToken);

    return { accessToken, refreshToken };
  });
}
