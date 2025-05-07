import Fastify from 'fastify';
import cors from '@fastify/cors';
import loginRoutes from './routes/login.js';
import booksRoutes from './routes/books.js';

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

  // Auth hook
  fastify.addHook('onRequest', async (request, reply) => {
    const url = request.raw.url; // reliable at this point in lifecycle

    // Allow login route through without auth
    if (url.startsWith('/api/login')) return;

    const auth = request.headers.authorization;
    const token = auth?.split(' ')[1];
    if (!token || token !== 'dummy-access') {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    request.user = { userName: 'admin' };
  });

  // Routes
  fastify.register(loginRoutes);
  fastify.register(booksRoutes);

  return fastify;
}
