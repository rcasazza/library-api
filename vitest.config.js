import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/test/**',
        '**/*.test.js',
        'server.js', // explicitly exclude server bootstrap script
        'seed-admin.js',
        'vitest.config.js',
      ],
      lines: 90,
      functions: 90,
      branches: 85,
    },
  },
});
