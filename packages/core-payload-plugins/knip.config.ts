import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  entry: [
    'src/index.ts',
  ],
  project: ['src/**/*.ts*'],
  typescript: {
    config: [
      'tsconfig.json',
    ],
  },
}

export default config
