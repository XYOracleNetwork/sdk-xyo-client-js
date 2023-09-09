import { defineConfig } from 'tsup'

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  bundle: true,
  cjsInterop: true,
  clean: false,
  dts: true,
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  sourcemap: true,
  splitting: false,
  tsconfig: 'tsconfig.json',
})
