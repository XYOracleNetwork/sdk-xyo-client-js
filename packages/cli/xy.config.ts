import { XyTsupConfig } from '@xylabs/ts-scripts-yarn3'
const config: XyTsupConfig = {
  compile: {
    browser: {},
    entryMode: 'all',
    node: {
      src: true,
    },
  },
}

// eslint-disable-next-line import/no-default-export
export default config
