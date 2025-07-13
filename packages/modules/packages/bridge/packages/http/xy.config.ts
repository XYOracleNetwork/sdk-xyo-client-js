import type { XyTsupConfig } from '@xylabs/ts-scripts-yarn3'
const config: XyTsupConfig = {
  compile: {
    browser: {},
    neutral: { src: { entry: ['index.ts'] } },
    node: {},
  },
}

export default config
