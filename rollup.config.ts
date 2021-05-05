import typescript from 'rollup-plugin-typescript2'

export default {
  input: './src/index.ts',
  output: [
    {
      exports: 'auto',
      file: './dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      exports: 'auto',
      file: './dist/index.esm.js',
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: [typescript()],
}
