import {
  typescriptConfig,
  unicornConfig,
  workspacesConfig,
  rulesConfig,
  sonarConfig,
  importConfig,
} from '@xylabs/eslint-config-flat'

export default [
  { ignores: ['.yarn', 'dist', '**/dist/**', 'build', '**/build/**', 'node_modules/**', 'public', '**/storybook-static', '**/.storybook'] },
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
