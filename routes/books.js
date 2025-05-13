export default async function booksRoutes(fastify) {
  fastify.get('/api/books', {
    schema: {
      tags: ['Books'],
      summary: 'Get all books for the user',
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              title: { type: 'string' },
              author: { type: 'string' },
              user: { type: 'string' },
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const rows = fastify.db.prepare('SELECT * FROM books').all();
      return rows;
    },
  });

  fastify.post('/api/books', {
    schema: {
      tags: ['Books'],
      summary: 'Add a new book',
      body: {
        type: 'object',
        required: ['title', 'author'],
        properties: {
          title: { type: 'string' },
          author: { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            author: { type: 'string' },
            user: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { title, author } = request.body;
      const user = request.user.userName;
      const result = fastify.db
        .prepare('INSERT INTO books (title, author, user) VALUES (?, ?, ?)')
        .run(title, author, user);

      return reply.code(201).send({
        id: result.lastInsertRowid,
        title,
        author,
        user,
      });
    },
  });
}
