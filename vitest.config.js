import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 10000, // ⏱ 10 seconds for all tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/test/**',
        '**/*.test.js',
        'server.js',
        'seed-admin.js',
        'vitest.config.js',
      ],
      lines: 90,
      functions: 90,
      branches: 85,
    },
  },
});
