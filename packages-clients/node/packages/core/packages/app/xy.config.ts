import { XyTsupConfig } from '@xylabs/ts-scripts-yarn3'
const config: XyTsupConfig = {
  compile: {
    browser: {},
    node: {
      src: { entry: ['src/index.ts', 'src/app.ts'] },
    },
  },
}

// eslint-disable-next-line import/no-default-export
export default config
