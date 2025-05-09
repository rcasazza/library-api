export default async function booksRoutes(fastify) {
  const db = fastify.db;

  fastify.get('/api/books', async (request, reply) => {
    const user = request.user.userName;
    const stmt = db.prepare('SELECT * FROM books WHERE user = ?');
    const books = stmt.all(user);
    return books;
  });

  fastify.post('/api/books', async (request, reply) => {
    const { title, author } = request.body;
    const user = request.user.userName;

    const stmt = db.prepare(
      'INSERT INTO books (title, author, user) VALUES (?, ?, ?)'
    );
    const info = stmt.run(title, author, user);

    return { id: info.lastInsertRowid, title, author, user };
  });
}
