import { XyTsupConfig } from '@xylabs/ts-scripts-yarn3'
const config: XyTsupConfig = {
  compile: {
    browser: {
      'src/browser': true,
    },
    node: {
      'src/node': true,
    },
  },
}

// eslint-disable-next-line import/no-default-export
export default config
