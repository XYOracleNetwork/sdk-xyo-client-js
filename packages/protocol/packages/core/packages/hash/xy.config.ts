import { XyTsupConfig } from '@xylabs/ts-scripts-yarn3'
const config: XyTsupConfig = {
  compile: {
    browser: {
      src: { entry: ['./src/index.ts', './src/worker/*'] },
    },
    node: {
      src: { entry: ['./src/index.ts', './src/worker/*'] },
    },
  },
}

// eslint-disable-next-line import/no-default-export
export default config
