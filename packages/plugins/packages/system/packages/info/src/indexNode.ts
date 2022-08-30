export * from '@xyo-network/node-system-info-payload-plugin'

import { XyoNodeSystemInfoPayloadPlugin } from '@xyo-network/node-system-info-payload-plugin'
import { XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

export const XyoSystemInfoPayloadPlugins: XyoPayloadPluginFunc[] = [XyoNodeSystemInfoPayloadPlugin]

// eslint-disable-next-line import/no-default-export
export default XyoSystemInfoPayloadPlugins
