import js from '@eslint/js';
import boundariesPlugin from 'eslint-plugin-boundaries';
import importPlugin from 'eslint-plugin-import';
import eslintConfigPrettier from 'eslint-config-prettier';
import turboPlugin from 'eslint-plugin-turbo';
import onlyWarn from 'eslint-plugin-only-warn';
import tseslint from 'typescript-eslint';

/**
 * Shared ESLint configuration for the monorepo.
 * This provides the base configuration that all packages extend.
 *
 * @type {import("eslint").Linter.Config}
 */
export const baseConfig = [
  {
    ignores: ['dist/**', 'build/**', '.next/**', 'node_modules/**', 'eslint.config.mjs', 'jest.config.cjs'],
  },
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    settings: {
      'import/resolver': {
        typescript: {
          project: ['apps/*/tsconfig.json', 'apps/*/tsconfig.spec.json', 'packages/*/tsconfig.json'],
        },
      },
      'boundaries/elements': [
        {
          type: 'app',
          pattern: '$app/**',
        },
        {
          type: 'components',
          pattern: '$components/**',
        },
        {
          type: 'domains',
          pattern: '$domains/**',
        },
        {
          type: 'modules',
          pattern: '$modules/**',
        },
        {
          type: 'shared',
          pattern: '$shared/**',
        },
      ],
    },
    plugins: {
      boundaries: boundariesPlugin,
      import: importPlugin,
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'off',
      // enforce consistent import order across all workspaces
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external', 'internal'], ['parent', 'sibling', 'index', 'object'], 'type'],
          pathGroups: [
            {
              pattern: '${app,components,domains,modules,shared}/**',
              group: 'parent',
            },
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true, orderImportKind: 'asc' },
        },
      ],
      // Clean Architecture boundaries enforcement
      // Dependency rule: app → components → domains → modules → shared
      'boundaries/element-types': [
        'error',
        {
          default: 'allow',
          rules: [
            {
              from: 'components',
              disallow: ['app'],
              message: 'Components should not depend on app.',
            },
            {
              from: 'domains',
              disallow: ['app', 'components'],
              message: 'Domains should not depend on app or components.',
            },
            {
              from: 'modules',
              disallow: ['app', 'components', 'domains'],
              message: 'Modules should only depend on shared.',
            },
            {
              from: 'shared',
              disallow: ['app', 'components', 'domains', 'modules'],
              message: 'Shared should not depend on any other layer.',
            },
          ],
        },
      ],
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
];
