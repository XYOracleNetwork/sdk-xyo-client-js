import {
  typescriptConfig,
  unicornConfig,
  workspacesConfig,
  rulesConfig,
  sonarConfig,
  importConfig,
} from '@xylabs/eslint-config-flat'

export default [
  { ignores: ['dist', '**/packages/*/dist', '.yarn', 'node_modules', '**/packages/*/node_modules'] },
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
