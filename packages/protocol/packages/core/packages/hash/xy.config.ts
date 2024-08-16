import type { XyTsupConfig } from '@xylabs/ts-scripts-yarn3'
const config: XyTsupConfig = {
  compile: {
    browser: {
      src: { entry: ['./src/index-browser.ts', './src/worker/*'] },
    },
    node: {
      src: { entry: ['./src/index.ts', './src/worker/*'] },
    },
  },
}

export default config
