import angularEslintPlugin from '@angular-eslint/eslint-plugin';
import angularTemplateParser from '@angular-eslint/template-parser';
import angularTemplatePlugin from '@angular-eslint/eslint-plugin-template';

import { baseConfig } from '@monorepo/eslint-config';

/**
 * ESLint configuration for Angular client application.
 *
 * @type {import("eslint").Linter.Config}
 * */
export default [
  // Apply baseConfig only to TypeScript files
  ...baseConfig.map((config) => ({
    ...config,
    files: config.files || ['src/**/*.ts'],
  })),
  {
    ignores: ['*.config.cjs', '*.config.mjs'],
  },
  // Angular ESLint TypeScript files configuration
  {
    files: ['src/**/*.ts'],
    plugins: {
      '@angular-eslint': angularEslintPlugin,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    processor: angularTemplatePlugin.processors['extract-inline-html'],
    rules: {
      ...angularEslintPlugin.configs.recommended.rules,
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: ['app'], style: 'camelCase' }],
      // 属性セレクターを使うコンポーネント（button, input等）はcamelCaseを許可
      '@angular-eslint/component-selector': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external'], ['internal', 'parent', 'sibling', 'index', 'object'], 'type'],
          pathGroups: [
            {
              pattern: '$app',
              group: 'internal',
            },
            {
              pattern: '$app/**',
              group: 'internal',
            },
            {
              pattern: '$components',
              group: 'internal',
            },
            {
              pattern: '$components/**',
              group: 'internal',
            },
            {
              pattern: '$environments',
              group: 'internal',
            },
            {
              pattern: '$i18n/**',
              group: 'internal',
            },
            {
              pattern: '$domains',
              group: 'internal',
            },
            {
              pattern: '$domains/**',
              group: 'internal',
            },
            {
              pattern: '$modules',
              group: 'internal',
            },
            {
              pattern: '$modules/**',
              group: 'internal',
            },
            {
              pattern: '$shared',
              group: 'internal',
            },
            {
              pattern: '$shared/**',
              group: 'internal',
            },
          ],
          alphabetize: { order: 'asc', caseInsensitive: true, orderImportKind: 'asc' },
          'newlines-between': 'always',
        },
      ],
    },
  },
  // HTML template files configuration
  {
    files: ['src/**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplatePlugin,
    },
    rules: {
      ...angularTemplatePlugin.configs.recommended.rules,
      ...angularTemplatePlugin.configs.accessibility.rules,
    },
  },
];
