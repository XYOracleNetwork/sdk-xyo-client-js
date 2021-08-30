import typescript from '@rollup/plugin-typescript'

export default [
  {
    external: [
      'axios',
      'tslib',
      '@xyo-network/sdk-xyo-js',
      '@xyo-network/sdk-xyo-mongo-js',
      'sha.js',
      'lodash/pick',
      'lodash/uniq',
      'is-ip',
      'mongodb',
      'ua-parser-js',
    ],
    input: 'src/index.ts',
    output: [
      {
        exports: 'auto',
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins: [typescript({ tsconfig: './tsconfig.cjs.json' })],
  },
  {
    external: [
      'axios',
      'tslib',
      '@xyo-network/sdk-xyo-js',
      '@xyo-network/sdk-xyo-mongo-js',
      'sha.js',
      'lodash/pick',
      'lodash/uniq',
      'is-ip',
      'ua-parser-js',
    ],
    input: 'src/browser.ts',
    output: [
      {
        exports: 'auto',
        file: 'dist/browser.cjs',
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins: [typescript({ tsconfig: './tsconfig.cjs.json' })],
  },
]
