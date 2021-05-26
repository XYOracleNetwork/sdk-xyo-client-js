import typescript from '@rollup/plugin-typescript'

export default [
  {
    external: ['axios', '@xyo-network/sdk-xyo-js', '@xyo-network/sdk-xyo-mongo-js', 'sha.js'],
    input: './src/index.ts',
    output: [
      {
        file: './dist/index.cjs',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: './dist/index.js',
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [typescript()],
  },
]
