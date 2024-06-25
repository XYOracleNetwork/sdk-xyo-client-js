// eslint.config.mjs

import { typescriptConfig, unicornConfig, prettierConfig, rulesConfig, workspacesConfig } from '@xylabs/eslint-config-flat'
import tsParser from '@typescript-eslint/parser'

// eslint-disable-next-line import/no-default-export
export default [
  {
    ignores: ['.yarn', '.yarn/**', '**/dist/**', 'dist/**', 'build/**', 'node_modules/**'],
  },
  prettierConfig,
  typescriptConfig,
  rulesConfig,
  workspacesConfig,
  {
    files: ['**/*.ts', '**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig-eslint.json',
      },
    },
    plugins: { ...typescriptConfig.plugins, ...unicornConfig.plugins, ...prettierConfig.plugins },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig-eslint.json',
        },
      },
    },
    rules: {
      ...typescriptConfig.rules,
      ...unicornConfig.rules,
      ...prettierConfig.rules,
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
      'no-unused-disable-directive': ['off'],
      'import/no-internal-modules': ['off'],
      'import/no-deprecated': ['off'],
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
