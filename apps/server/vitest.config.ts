import 'reflect-metadata';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

import type { PluginOption } from 'vite';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

const swcPlugin = swc.vite({
  sourceMaps: true,
  jsc: {
    parser: {
      syntax: 'typescript',
      decorators: true,
      dynamicImport: true,
    },
    transform: {
      legacyDecorator: true,
      decoratorMetadata: true,
    },
    target: 'es2023',
    keepClassNames: true,
  },
  module: { type: 'es6' },
  minify: false,
}) as PluginOption;

const resolveAlias = {
  alias: {
    $adapters: path.resolve(dirname, 'src/shared/adapters'),
    $decorators: path.resolve(dirname, 'src/shared/decorators'),
    $domains: path.resolve(dirname, 'src/domains'),
    $exceptions: path.resolve(dirname, 'src/shared/exceptions'),
    $filters: path.resolve(dirname, 'src/shared/filters'),
    $guards: path.resolve(dirname, 'src/shared/guards'),
    $interceptors: path.resolve(dirname, 'src/shared/interceptors'),
    $modules: path.resolve(dirname, 'src/modules'),
    $shared: path.resolve(dirname, 'src/shared'),
    $utils: path.resolve(dirname, 'src/shared/utils'),
  },
};

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [swcPlugin],
        resolve: resolveAlias,
        test: {
          name: 'unit',
          globals: true,
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        plugins: [swcPlugin],
        resolve: resolveAlias,
        test: {
          name: 'e2e',
          globals: true,
          environment: 'node',
          include: ['src/**/*.spec.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'json', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.dto.ts',
        'src/**/*.module.ts',
        'src/**/*.spec.ts',
        'src/**/*.test.ts',
        'src/**/index.ts',
        'src/main.ts',
      ],
    },
  },

  resolve: resolveAlias,
});
