// routes/books.js
export default async function booksRoutes(fastify) {
  fastify.get('/api/books', async (request, reply) => {
    return [
      { id: 1, title: 'The Hobbit', author: 'J.R.R. Tolkien' },
      { id: 2, title: 'Dune', author: 'Frank Herbert' },
    ];
  });
}
