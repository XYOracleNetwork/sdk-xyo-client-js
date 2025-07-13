import type { XyTsupConfig } from '@xylabs/ts-scripts-yarn3'
const config: XyTsupConfig = {
  compile: {
    browser: { src: { entry: ['index-browser.ts'] } },
    node: { src: { entry: ['index.ts'] } },
    neutral: { src: { entry: ['index.ts'] } },
  },
}

export default config
