import typescript from 'rollup-plugin-typescript2'

import pkg from './package.json'

export default {
  input: 'src/index.ts',
  output: [
    {
      exports: 'auto',
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      exports: 'auto',
      file: pkg.module,
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: [typescript()],
}
