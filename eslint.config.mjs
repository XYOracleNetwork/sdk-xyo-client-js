import {
  typescriptConfig,
  unicornConfig,
  workspacesConfig,
  rulesConfig,
  sonarConfig,
  importConfig,
} from '@xylabs/eslint-config-flat'

const disallowedImports = [
  '@xylabs/api',
  '@xylabs/array',
  '@xylabs/arraybuffer',
  '@xylabs/assert',
  '@xylabs/axios',
  '@xylabs/base',
  '@xylabs/bignumber',
  '@xylabs/buffer',
  '@xylabs/creatable',
  '@xylabs/decimal-precision',
  '@xylabs/delay',
  '@xylabs/enum',
  '@xylabs/error',
  '@xylabs/eth-address',
  '@xylabs/events',
  '@xylabs/exists',
  '@xylabs/forget',
  '@xylabs/function-name',
  '@xylabs/hex',
  '@xylabs/log',
  '@xylabs/logger',
  '@xylabs/object',
  '@xylabs/platform',
  '@xylabs/profile',
  '@xylabs/promise',
  '@xylabs/retry',
  '@xylabs/set',
  '@xylabs/static-implements',
  '@xylabs/storage',
  '@xylabs/telemetry',
  '@xylabs/telemetry-exporter',
  '@xylabs/timer',
  '@xylabs/typeof',
  '@xylabs/url',
]

export default [
  {
    ignores: ['dist',
      '**/packages/*/dist',
      'build',
      '**/packages/*/build',, '.yarn',
      'node_modules',
      '**/packages/*/node_modules',
      'docs',
      '.dependency-cruiser.mjs'],
  },
  unicornConfig,
  workspacesConfig,
  rulesConfig,
  typescriptConfig,
  importConfig,
  sonarConfig,
  {
    rules: {
      'no-warning-comments': ['warn', { terms: ['note'], location: 'anywhere' }],
      '@typescript-eslint/strict-boolean-expressions': ['off'],
      'sonarjs/prefer-single-boolean-return': ['off'],
      'import-x/no-unresolved': ['off'],
    },
  },
  {
    files: ['**/packages/*/src/**/*.{js,ts}'],
    ignores: ['**/*.spec.{js,ts}', 'packages/sdk/src/test/**/*', 'packages/cli/src/**/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...disallowedImports,
          ],
        },
      ],
    },
  },
  {
    files: ['**/packages/*/src/**/*.{jsx,tsx}'],
    ignores: ['**/*.spec.{jsx,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            'node:*',
            ...disallowedImports,
          ],
        },
      ],
    },
  },
]
