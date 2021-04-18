import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

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
  plugins: [commonjs(), resolve({ preferBuiltins: true }), json(), typescript({ tsconfig: './tsconfig.json' })],
}
