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
    files: ['src/**/*.ts', 'scripts/**/*.ts'],
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
      // angular-eslint/ts-recommended (flat configs moved out of the plugin in v22)
      '@angular-eslint/contextual-lifecycle': 'error',
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-inputs-metadata-property': 'error',
      '@angular-eslint/no-output-native': 'error',
      '@angular-eslint/no-output-on-prefix': 'error',
      '@angular-eslint/no-output-rename': 'error',
      '@angular-eslint/no-outputs-metadata-property': 'error',
      '@angular-eslint/prefer-inject': 'error',
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/use-pipe-transform-interface': 'error',
      '@angular-eslint/use-lifecycle-interface': 'warn',
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: ['app'], style: 'camelCase' }],
      // Allow camelCase for components using attribute selectors (button, input, etc.)
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
      // angular-eslint/template-recommended
      '@angular-eslint/template/banana-in-box': 'error',
      '@angular-eslint/template/eqeqeq': 'error',
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/prefer-control-flow': 'error',
      // angular-eslint/template-accessibility
      '@angular-eslint/template/alt-text': 'error',
      '@angular-eslint/template/click-events-have-key-events': 'error',
      '@angular-eslint/template/elements-content': 'error',
      '@angular-eslint/template/interactive-supports-focus': 'error',
      '@angular-eslint/template/label-has-associated-control': 'error',
      '@angular-eslint/template/mouse-events-have-key-events': 'error',
      '@angular-eslint/template/no-autofocus': 'error',
      '@angular-eslint/template/no-distracting-elements': 'error',
      '@angular-eslint/template/role-has-required-aria': 'error',
      '@angular-eslint/template/table-scope': 'error',
      '@angular-eslint/template/valid-aria': 'error',
    },
  },
];
