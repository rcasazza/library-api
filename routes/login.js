// routes/login.js
import { v4 as uuidv4 } from 'uuid';

export default async function loginRoutes(fastify) {
  fastify.post('/api/login', async (request, reply) => {
    const { userName, password } = request.body;

    if (userName === 'admin' && password === 'secret') {
      const accessToken = fastify.jwt.sign(
        { userName },
        { expiresIn: '1m' } // xx-minute access token
      );

      const jti = uuidv4();
      const refreshToken = fastify.jwt.sign(
        { userName, jti },
        { expiresIn: '7d' }
      );

      fastify.tokenStore.storeRefreshToken(jti, refreshToken);

      return { accessToken, refreshToken };
    }

    return reply
      .code(403)
      .send({ success: false, message: 'Invalid credentials' });
  });
}
