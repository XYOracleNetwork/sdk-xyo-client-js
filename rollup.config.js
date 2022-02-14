import { getRollupConfig } from '@xylabs/rollup-config'

import pkg from './package.json'

export default getRollupConfig({pkg, browserIndex: './src/browser.ts', nodeIndex: './src/node.ts'})
