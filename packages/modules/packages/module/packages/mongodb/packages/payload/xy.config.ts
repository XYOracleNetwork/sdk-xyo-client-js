import type { XyTsupConfig } from '@xylabs/ts-scripts-yarn3'
const config: XyTsupConfig = {
  compile: {
    entryMode: 'custom',
    neutral: {},
    browser: {},
    node: { src: { entry: ['./src/index.ts'] } },
  },
}

export default config
