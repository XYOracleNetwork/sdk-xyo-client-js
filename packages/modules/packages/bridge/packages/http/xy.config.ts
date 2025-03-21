import type { XyTsupConfig } from '@xylabs/ts-scripts-yarn3'
const config: XyTsupConfig = {
  compile: {
    browser: { src: { entry: ['./src/index-client.ts'] } },
    neutral: { src: { entry: ['./src/index-client.ts'] } },
    node: { src: { entry: ['./src/index.ts', './src/index-client.ts'] } },
  },
}

export default config
