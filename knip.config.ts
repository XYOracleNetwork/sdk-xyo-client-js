import type { KnipConfig } from 'knip'

const entry = ['src/index.ts*', 'src/index-*.ts*', '*.ts', '*.mjs', 'scripts/**/*.*', 'bin/*', 'src/**/*.stories.ts*', 'src/**/*.spec.ts']
const project = ['src/**/*.ts*']
const ignore = ['packages/**']
const typescript = {
  config: [
    'tsconfig.json',
  ],
}

const config: KnipConfig = {
  entry,
  ignore,
  project,
  typescript,
  ignoreDependencies: ['@xylabs/ts-scripts-yarn3', 'tslib'],
  workspaces: {
    '.': {
      entry,
      project,
      ignoreDependencies: [
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
        'eslint',
        'eslint-import-resolver-typescript',
      ],
    },
    'packages/*': {
      entry,
      ignore,
      project,
      typescript,
    },
    'packages/*/packages/*': {
      entry,
      ignore,
      project,
      typescript,
    },
    'packages/*/packages/packages/*': {
      entry,
      ignore,
      project,
      typescript,
    },
    'packages/*/packages/*/packages/*': {
      entry,
      ignore,
      project,
      typescript,
    },
    'packages/*/packages/*/packages/*/packages/*': {
      entry,
      ignore,
      project,
      typescript,
    },
    'packages/*/packages/*/packages/*/packages/*/packages/*': {
      entry,
      ignore,
      project,
      typescript,
    },
  },
}

export default config
