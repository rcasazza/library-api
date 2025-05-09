import dotenv from 'dotenv';
import { buildApp } from './app.js';

const app = buildApp();

const port = process.env.PORT || 3000;

app.listen({ port }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log('🚀 Server listening on http://localhost:3000');
});
