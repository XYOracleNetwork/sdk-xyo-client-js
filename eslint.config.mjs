// eslint.config.mjs

import {
  typescriptConfig,
  unicornConfig,
  workspacesConfig,
  rulesConfig,
  importConfig,
} from '@xylabs/eslint-config-flat'

export default [
  {
    ignores: [
      '.yarn/**',
      'jest.config.cjs',
      '**/dist/**',
      'dist',
      'build/**',
      'node_modules/**',
      'public',
      '.storybook',
      'storybook-static',
      '**/docs/**/*.js',
    ],
  },
  unicornConfig,
  workspacesConfig,
  rulesConfig,
  {
    ...typescriptConfig,
    rules: {
      ...typescriptConfig.rules,
      '@typescript-eslint/consistent-type-imports': ['warn'],
    },
  },
  {
    rules: {
      'no-restricted-imports': [
        'warn',
        {
          paths: [
            ...rulesConfig.rules['no-restricted-imports'][1].paths,
            '@types/node',
            '@xylabs/lodash',
            '@xyo-network/archivist',
            '@xyo-network/bridge',
            '@xyo-network/core',
            '@xyo-network/diviner',
            '@xyo-network/module',
            '@xyo-network/modules',
            '@xyo-network/node',
            '@xyo-network/sdk',
            '@xyo-network/plugins',
            '@xyo-network/protocol',
            '@xyo-network/sentinel',
            '@xyo-network/witness',
            '@xyo-network/core-payload-plugins',
          ],
        },
      ],
    },
  },
  {
    ...importConfig,
    rules: {
      ...importConfig.rules,
      'import-x/no-internal-modules': [
        'warn',
        {
          allow: [
            '**/*.json', // Allow JSON imports
            'vitest/**', // Allow vitest internal imports
            '@*/**', // Allow imports from any @scoped package
            // Allow imports to any index.js file
            '**/index.js',
            '**/index.ts',
            '**/index.jsx',
            '**/index.tsx',
          ],
        },
      ],
      'import-x/no-cycle': ['warn', { maxDepth: 5 }],
    },
  },
]
