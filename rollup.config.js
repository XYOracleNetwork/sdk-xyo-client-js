import { getRollupConfig } from '@xylabs/rollup-config'

import pkg from './package.json'

export default getRollupConfig({pkg, browserIndex: './src/browserIndex.ts', nodeIndex: './src/nodeIndex.ts', bundlePrefix: 'bundle/'})
