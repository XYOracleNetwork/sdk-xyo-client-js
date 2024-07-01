// eslint.config.mjs

import tsParser from '@typescript-eslint/parser'
import { importConfig, prettierConfig, rulesConfig, typescriptConfig, unicornConfig, workspacesConfig } from '@xylabs/eslint-config-flat'
import deprecation from 'eslint-plugin-deprecation'

// eslint-disable-next-line import/no-default-export
export default [
  {
    ignores: ['.yarn', '.yarn/**', '**/dist/**', 'dist/**', 'build/**', 'node_modules/**'],
  },
  workspacesConfig,
  unicornConfig,
  prettierConfig,
  rulesConfig,
  {
    ...typescriptConfig,
    plugins: { deprecation, ...typescriptConfig.plugins },
    rules: {
      ...typescriptConfig.rules,
      'deprecation/deprecation': ['warn'],
    },
  },
  {
    ...importConfig,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { modules: true },
        ecmaVersion: 'latest',
        project: './tsconfig-eslint.json',
      },
    },
    rules: {
      ...importConfig.rules,
      'import/no-deprecated': ['warn'],
      'import/no-internal-modules': ['off'],
    },
  },
  {
    rules: {
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

      //'no-secrets/no-secrets': ['off'],
      'no-tabs': ['error'],

      'no-unused-disable-directive': ['off'],
      'no-unused-vars': 'off',
      'no-useless-escape': 'off',
      quotes: [2, 'single', 'avoid-escape'],
      'require-await': 'error',
      semi: ['warn', 'never'],
    },
  },
]
