import {
  typescriptConfig,
  unicornConfig,
  workspacesConfig,
  rulesConfig,
  sonarConfig,
  importConfig,
} from '@xylabs/eslint-config-flat'

export default [
  { ignores: ['eslint.config.mjs'] },
  unicornConfig,
  workspacesConfig,
  rulesConfig,
  typescriptConfig,
  importConfig,
  sonarConfig,
  {
    rules: {
      'sonarjs/prefer-single-boolean-return': ['off'],
      'import-x/no-unresolved': ['off'],
    },
  },
]
