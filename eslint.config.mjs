// eslint.config.mjs

import { typescriptConfig, importConfig, unicornConfig, prettierConfig, rulesConfig, workspacesConfig } from '@xylabs/eslint-config-flat'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    ignores: ['.yarn', '.yarn/**', '**/dist/**', 'dist/**', 'build/**', 'node_modules/**'],
  },
  workspacesConfig,
  typescriptConfig,
  unicornConfig,
  prettierConfig,
  rulesConfig,
  {
    ...importConfig,
    rules: {
      ...importConfig.rules,
      'import/no-deprecated': ['off'],
      'import/no-internal-modules': ['off'],
    },
  },
  {
    rules: {
      'no-unused-disable-directive': ['off'],
      complexity: ['error', 18],
      'max-depth': ['error', 6],
      'max-lines': [
        'error',
        {
          max: 512,
          skipBlankLines: true,
        },
      ],
      'max-nested-callbacks': ['error', 6],
      'max-statements': ['error', 32],
      'no-restricted-imports': [
        'warn',
        {
          paths: [
            'lodash',
            'react-player',
            'filepond',
            'aos',
            'react-icons',
            '.',
            '..',
            '../..',
            '../../..',
            '../../../..',
            '../../../../..',
            '../../../../../..',
            '../../../../../../..',
          ],
        },
      ],
      //'no-secrets/no-secrets': ['off'],
      'no-tabs': ['error'],
      'no-unused-vars': 'off',
      'no-useless-escape': 'off',
      quotes: [2, 'single', 'avoid-escape'],
      'require-await': 'error',
      semi: ['warn', 'never'],
      'no-restricted-imports': [
        'warn',
        {
          paths: [
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
            'react-player',
            'filepond',
            'aos',
            'react-icons',
            '.',
            '..',
            '../..',
            '../../..',
            '../../../..',
            '../../../../..',
            '../../../../../..',
            '../../../../../../..',
          ],
        },
      ],
    },
  },
]
