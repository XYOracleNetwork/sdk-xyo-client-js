export * from '@xyo-network/node-system-info-payload-plugin'

import { XyoNodeSystemInfoPayloadPlugin } from '@xyo-network/node-system-info-payload-plugin'

import { XyoAllPayloadPlugins } from './indexShared'

export const XyoAllNodePayloadPlugins = [...XyoAllPayloadPlugins, XyoNodeSystemInfoPayloadPlugin]

// eslint-disable-next-line import/no-default-export
export default XyoAllNodePayloadPlugins
