import type { KnipConfig } from 'knip'

const entry = ['src/index.ts*', 'src/index-*.ts*', '*.ts', '*.mjs', 'scripts/**/*.*', 'bin/*', 'src/**/*.stories.ts*', 'src/**/*.spec.ts']
const project = ['src/**/*.ts*', '*.ts*']

const config: KnipConfig = {
  entry: [
    'src/index.ts*',
    'src/index-*.ts*',
    '*.ts',
    '*.mjs',
    'scripts/**/*.*',
    'bin/*',
    'src/**/*.stories.ts*',
    'src/**/*.spec.ts',
  ],
  project: ['src/**/*.ts*', '*.ts*'],
  ignoreDependencies: ['@xylabs/ts-scripts-yarn3', 'tslib'],
  workspaces: {
    '.': {
      entry: [...entry, 'src/**/*.ts', './storybook/**/*.ts', 'vite.config.ts'],
      project,
      ignoreDependencies: [
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
        'eslint',
        'eslint-import-resolver-typescript',
      ],
    },
    'packages/*': { entry, project },
    'packages/*/packages/*': { entry, project },
    'packages/*/packages/packages/*': { entry, project },
    'packages/*/packages/*/packages/*': { entry, project },
    'packages/*/packages/*/packages/*/packages/*': { entry, project },
  },
  typescript: {
    config: [
      'tsconfig.json',
      'packages/**/*/tsconfig.json',
    ],
  },
}

export default config
