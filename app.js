import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import loginRoutes from './routes/login.js';
import booksRoutes from './routes/books.js';
import refreshRoutes from './routes/refresh.js';
import logoutRoutes from './routes/logout.js';
import adminRoutes from './routes/admins.js';
import * as tokenStore from './lib/tokenStore.js';
import db from './lib/db.js';

import {
  revokeAccessToken,
  isAccessTokenRevoked,
} from './lib/tokenBlackList.js';

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

  // Decorate with refresh token store
  fastify.decorate('tokenStore', tokenStore);

  // Attach the shared blacklist to the Fastify instance
  fastify.decorate('tokenBlacklist', {
    revokeAccessToken,
    isAccessTokenRevoked,
  });

  fastify.decorate('db', db); // app.db is now accessible in routes

  fastify.decorateRequest('requireRole', function (role) {
    const user = this.user;
    if (!user || user.role !== role) {
      throw fastify.httpErrors.forbidden('Forbidden');
    }
  });

  // Register CORS
  fastify.register(cors, {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });

  // Register JWT plugin with secret
  fastify.register(jwt, {
    secret: process.env.JWT_SECRET,
  });

  // Auth hook
  fastify.addHook('onRequest', async (request, reply) => {
    const url = request.raw.url;
    if (
      url.startsWith('/api/login') ||
      url.startsWith('/api/refresh') ||
      url.startsWith('/api/logout')
    ) {
      return;
    }

    try {
      await request.jwtVerify(); // 401 if expired or invalid

      const token = request.headers.authorization?.split(' ')[1];

      console.log('Checking token:', token);
      console.log('Is blacklisted:', isAccessTokenRevoked(token));

      if (fastify.tokenBlacklist.isAccessTokenRevoked(token)) {
        return reply.code(401).send({ error: 'Token has been revoked' });
      }
    } catch (err) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  fastify.register(adminRoutes);
  fastify.register(loginRoutes);
  fastify.register(booksRoutes);
  fastify.register(refreshRoutes);
  fastify.register(logoutRoutes);

  console.log('[app.js] fastify.requireRole =', typeof fastify.requireRole);

  return fastify;
}
