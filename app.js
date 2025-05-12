import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import loginRoutes from './routes/login.js';
import booksRoutes from './routes/books.js';
import refreshRoutes from './routes/refresh.js';
import logoutRoutes from './routes/logout.js';
import adminRoutes from './routes/admins.js';
import registerRoutes from './routes/register.js';

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
      : true,
  });

  fastify.decorate('tokenStore', tokenStore);
  fastify.decorate('tokenBlacklist', {
    revokeAccessToken,
    isAccessTokenRevoked,
  });
  fastify.decorate('db', db);

  fastify.decorateRequest('requireRole', function (role) {
    const user = this.user;
    if (!user || user.role !== role) {
      throw fastify.httpErrors.forbidden('Forbidden');
    }
  });

  fastify.register(cors, {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });

  fastify.register(jwt, {
    secret: process.env.JWT_SECRET,
  });

  fastify.addHook('onRequest', async (request, reply) => {
    const url = request.raw.url;
    if (
      url.startsWith('/api/login') ||
      url.startsWith('/api/refresh') ||
      url.startsWith('/api/logout') ||
      url.startsWith('/api/register')
    ) {
      return;
    }

    try {
      await request.jwtVerify();

      const token = request.headers.authorization?.split(' ')[1];

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
  fastify.register(registerRoutes);

  return fastify;
}
