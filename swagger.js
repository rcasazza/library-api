import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

export async function registerSwagger(fastify) {
  console.log('[swagger] Swagger registration started');
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Library API',
        description: 'API documentation for managing users, books, and roles',
        version: '1.0.0',
      },
    },
  });

  await fastify.register(swaggerUI, {
    routePrefix: '/docs',
    staticCSP: true,
    transformStaticCSP: (header) => header,
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  console.log('[swagger] Swagger docs available at /docs');
}
