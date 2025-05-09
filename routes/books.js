// routes/books.js
export default async function booksRoutes(fastify) {
  fastify.get('/api/books', async (request, reply) => {
    const user = request.user; // available after jwtVerify()
    return [
      { id: 1, title: 'The Hobbit', author: 'Tolkien', user: user.userName },
      { id: 2, title: 'Dune', author: 'Herbert' },
    ];
  });
}
