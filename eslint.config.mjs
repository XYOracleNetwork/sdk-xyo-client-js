// eslint.config.mjs

import { config as xylabsConfig, rulesConfig } from '@xylabs/eslint-config-flat'

export default [
  {
    ignores: ['.yarn/**', 'jest.config.cjs', '**/dist/**', 'dist', 'build/**', 'node_modules/**'],
  },
  ...xylabsConfig,
  {
    rules: {
      'no-restricted-imports': [
        'warn',
        {
          paths: [
            ...rulesConfig.rules['no-restricted-imports'][1].paths,
            '@types/node',
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
]
