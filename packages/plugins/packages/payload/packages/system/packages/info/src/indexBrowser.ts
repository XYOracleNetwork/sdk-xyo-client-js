export * from '@xyo-network/bowser-system-info-payload-plugin'

import { BowserSystemInfoPayloadPlugin } from '@xyo-network/bowser-system-info-payload-plugin'
import { PayloadPluginFunc } from '@xyo-network/payload-plugin'

export const XyoSystemInfoPayloadPlugins: PayloadPluginFunc[] = [BowserSystemInfoPayloadPlugin]

// eslint-disable-next-line import/no-default-export
export default XyoSystemInfoPayloadPlugins
