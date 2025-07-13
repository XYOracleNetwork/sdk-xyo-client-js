import type { XyTsupConfig } from '@xylabs/ts-scripts-yarn3'
const config: XyTsupConfig = {
  compile: {
    browser: { src: { entry: ['index-browser.ts', 'worker/subtleHash.ts', 'worker/wasmHash.ts'] } },
    node: { src: { entry: ['index.ts', 'worker/subtleHashNode.ts', 'worker/wasmHashNode.ts'] } },
  },
}

export default config
