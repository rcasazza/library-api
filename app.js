import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import loginRoutes from './routes/login.js';
import booksRoutes from './routes/books.js';
import refreshRoutes from './routes/refresh.js';

const isDev = process.env.NODE_ENV !== 'production';

export function buildApp() {
  const fastify = Fastify({
    logger: isDev
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          },
        }
      : true, // enable normal logging in production
  });

  // Register CORS
  fastify.register(cors, {
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // Register JWT plugin with secret
  fastify.register(jwt, {
    secret: 'your-super-secret-key', // Replace with env var in prod
  });

  // Auth hook
  fastify.addHook('onRequest', async (request, reply) => {
    const url = request.raw.url;
    if (url.startsWith('/api/login') || url.startsWith('/api/refresh')) {
      return;
    }

    try {
      await request.jwtVerify(); // 401 if expired or invalid
    } catch (err) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  // Routes
  fastify.register(loginRoutes);
  fastify.register(booksRoutes);
  fastify.register(refreshRoutes);

  return fastify;
}
