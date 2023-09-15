import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import { copyFile } from 'fs/promises'
import { rollup } from 'rollup'
import externalDeps from 'rollup-plugin-exclude-dependencies-from-bundle'

const buildIt = async () => {
  await (
    await rollup({
      input: 'src/index.ts',
      logLevel: 'debug',
      perf: true,
      plugins: [
        commonjs(),
        externalDeps(),
        typescript({
          declaration: true,
          declarationMap: true,
          emitDeclarationOnly: false,
          exclude: ['src/**/*.spec.*', 'dist', 'docs'],
          outDir: 'dist',
          rootDir: 'src',
          tsconfig: 'tsconfig.json',
        }),
      ],
    })
  ).write({
    dir: 'dist',
    entryFileNames: (chunkInfo) => `${chunkInfo.name}.mjs`,
    format: 'esm',
    sourcemap: true,
  })

  await (
    await rollup({
      input: 'src/index.ts',
      logLevel: 'warn',
      perf: true,
      plugins: [
        externalDeps(),
        typescript({
          declaration: true,
          declarationMap: true,
          emitDeclarationOnly: false,
          exclude: ['src/**/*.spec.*', 'dist', 'docs'],
          outDir: 'dist',
          rootDir: 'src',
          tsconfig: 'tsconfig.json',
        }),
      ],
    })
  ).write({
    dir: 'dist',
    entryFileNames: (chunkInfo) => `${chunkInfo.name}.js`,
    format: 'cjs',
    sourcemap: true,
  })
  await copyFile('./dist/index.d.ts', './dist/index.d.mts')
  await copyFile('./dist/index.d.ts.map', './dist/index.d.mts.map')
}

buildIt()
  .then(() => {
    console.log('Done')
  })
  .catch((error) => console.error(error))
