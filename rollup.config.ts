import typescript from 'rollup-plugin-typescript2'

export default {
  input: './src/index.ts',
  output: [
    {
      exports: 'auto',
      file: './dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
    },
    {
      exports: 'auto',
      file: './dist/index.mjs',
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: [typescript()],
}
