import { defineConfig } from 'tsup'

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  bundle: true,
  cjsInterop: true,
  clean: true,
  dts: {
    entry: ['src/index.ts'],
  },
  entry: ['src'],
  format: ['cjs', 'esm'],
  sourcemap: true,
  splitting: false,
  tsconfig: 'tsconfig.json',
})
