import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  entry: ['src/index.ts', 'src/index-*.ts'],
  project: ['src/**/*.ts'],
  ignore: ['xy.config.ts'],
  ignoreDependencies: [
    '@xylabs/ts-scripts-yarn3',
  ],
  workspaces: {
    '.': {
      ignoreDependencies: [
        'eslint',
        '@typescript-eslint/eslint-plugin',
        'eslint-import-resolver-typescript',
        'reflect-metadata',
        '@typescript-eslint/parser',
      ],
    },
  },
}

export default config
