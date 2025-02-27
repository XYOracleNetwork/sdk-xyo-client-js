import type { XyTsupConfig } from '@xylabs/ts-scripts-yarn3'
const config: XyTsupConfig = {
  compile: {
    browser: {},
    node: { src: true },
    neutral: {},
  },
}

export default config
