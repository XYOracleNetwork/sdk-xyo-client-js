import { defineConfig } from 'tsup'

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  bundle: true,
  cjsInterop: false, // TODO: Set to true when we have a better solution for import?.meta?.url in CJS
  clean: false,
  dts: {
    entry: ['src/index.ts'],
  },
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  sourcemap: true,
  splitting: false,
  tsconfig: 'tsconfig.json',
})
