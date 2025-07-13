import {
  typescriptConfig,
  unicornConfig,
  workspacesConfig,
  rulesConfig,
  sonarConfig,
  importConfig,
} from '@xylabs/eslint-config-flat'

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
      'sonarjs/prefer-single-boolean-return': ['off'],
      'import-x/no-unresolved': ['off'],
    },
  },
]
