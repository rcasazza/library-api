import bcrypt from 'bcrypt';

function isPasswordStrong(password) {
  return (
    typeof password === 'string' && password.length >= 8 && /\d/.test(password)
  );
}

function isEmailValid(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email);
}

export default async function registerRoutes(fastify) {
  fastify.post('/api/register', async (request, reply) => {
    let { username, email, password } = request.body;

    username = username?.trim();
    email = email?.trim();
    password = password?.trim();

    if (!username || !email || !password) {
      return reply.code(400).send({ error: 'All fields are required' });
    }

    if (!isEmailValid(email)) {
      return reply.code(400).send({ error: 'Invalid email format' });
    }

    if (!isPasswordStrong(password)) {
      return reply
        .code(400)
        .send({
          error: 'Password must be at least 8 characters and include a number',
        });
    }

    const existing = fastify.db
      .prepare('SELECT id FROM users WHERE username = ? OR email = ?')
      .get(username, email);

    if (existing) {
      return reply
        .code(409)
        .send({ error: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = fastify.db
      .prepare(
        `
      INSERT INTO users (username, password, email, role, is_verified)
      VALUES (?, ?, ?, ?, ?)
    `
      )
      .run(username, hashedPassword, email, 'user', 0);

    return reply.code(201).send({
      id: result.lastInsertRowid,
      username,
      email,
      role: 'user',
      is_verified: false,
    });
  });
}
