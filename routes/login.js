import bcrypt from 'bcrypt';
import { preValidationTrim } from '../lib/preValidationTrim.js';

export default async function loginRoutes(fastify) {
  fastify.post('/api/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Authenticate user and return tokens',
      body: {
        type: 'object',
        required: ['userName', 'password'],
        properties: {
          userName: { type: 'string' },
          password: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
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
    preValidation: preValidationTrim,
    handler: async (request, reply) => {
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

      const jti = crypto.randomUUID();
      const refreshToken = fastify.jwt.sign(
        { userName: user.username, role: user.role, jti },
        { expiresIn: '7d' }
      );

      fastify.tokenStore.storeRefreshToken(jti, user.username);

      return { accessToken, refreshToken };
    },
  });
}
