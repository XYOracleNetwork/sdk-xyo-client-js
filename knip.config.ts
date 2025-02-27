import type { KnipConfig } from 'knip'

type WorkspaceConfig = Exclude<KnipConfig['workspaces'], undefined>[keyof KnipConfig['workspaces']]

const defaultWorkspaceConfig: WorkspaceConfig = {
  entry: ['src/index.ts', 'src/index-*.ts'],
  project: ['src/**/*.ts'],
  ignore: ['xy.config.ts'],
  ignoreDependencies: [
    '@xylabs/tsconfig*',
    '@xylabs/ts-scripts-yarn3',
  ],
  typescript: {
    config: [
      'tsconfig.json',
    ],
  },
}

const config: KnipConfig = {
  workspaces: {
    '.': {
      ...defaultWorkspaceConfig,
      ignoreDependencies: [
        'eslint',
        '@typescript-eslint/eslint-plugin',
        'eslint-import-resolver-typescript',
        'reflect-metadata',
        '@typescript-eslint/parser',
      ],
    },
    'packages/*': { ...defaultWorkspaceConfig },
    'packages/*/packages/*': { ...defaultWorkspaceConfig },
    'packages/*/packages/*/packages/*': { ...defaultWorkspaceConfig },
    'packages/*/packages/*/packages/*/packages/*': { ...defaultWorkspaceConfig },
    'packages/*/packages/*/packages/*/packages/*/packages/*': { ...defaultWorkspaceConfig },
  },
}

export default config
