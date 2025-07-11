import type { XyTsupConfig } from '@xylabs/ts-scripts-yarn3'
const config: XyTsupConfig = {
  compile: {
    browser: { src: { entry: ['./src/index-browser.ts', './src/worker/subtleHash.ts', './src/worker/wasmHash.ts'] } },
    node: { src: { entry: ['./src/index.ts', './src/worker/subtleHashNode.ts', './src/worker/wasmHashNode.ts'] } },
  },
}

export default config
