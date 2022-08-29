export * from '@xyo-network/bowser-system-info-payload-plugin'

import { XyoBowserSystemInfoPayloadPlugin } from '@xyo-network/bowser-system-info-payload-plugin'
import { XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

export const XyoSystemInfoPayloadPlugins: XyoPayloadPluginFunc[] = [XyoBowserSystemInfoPayloadPlugin]

// eslint-disable-next-line import/no-default-export
export default XyoSystemInfoPayloadPlugins
