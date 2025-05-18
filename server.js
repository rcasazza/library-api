import { buildApp } from './app.js'; // or './buildApp.js' if renamed
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env

const PORT = process.env.PORT || 3000;

const app = await buildApp();

app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }

  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
