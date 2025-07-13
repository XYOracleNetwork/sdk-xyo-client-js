import type { XyTsupConfig } from '@xylabs/ts-scripts-yarn3'
const config: XyTsupConfig = {
  compile: {
    entryMode: 'custom',
    neutral: {},
    browser: {},
    node: { src: { entry: ['index.ts'] } },
  },
}

export default config
