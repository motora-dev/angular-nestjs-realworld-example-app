import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          globals: true,
          environment: 'jsdom',
          include: ['src/**/*.test.ts'],
          setupFiles: ['src/test-setup.ts'],
        },
      },
      {
        test: {
          name: 'e2e',
          globals: true,
          environment: 'node',
          include: ['src/test/**/*.spec.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'json', 'lcov', 'clover'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.config.ts',
        'src/**/*.config.server.ts',
        'src/**/*.routes.ts',
        'src/**/*.routes.server.ts',
        'src/**/*.spec.ts',
        'src/**/*.stories.ts',
        'src/**/*.test.ts',
        'src/**/index.ts',
        'src/main.server.ts',
        'src/main.ts',
        'src/server.ts',
        'src/test-setup.ts',
      ],
    },
  },
});
