import { XyTsupConfig } from '@xylabs/ts-scripts-yarn3'
const config: XyTsupConfig = {
  compile: {
    browser: {
      src: { entry: ['./src/index-browser.ts'] },
    },
    node: {
      src: { entry: ['./src/index.ts'] },
    },
  },
}

// eslint-disable-next-line import/no-default-export
export default config
