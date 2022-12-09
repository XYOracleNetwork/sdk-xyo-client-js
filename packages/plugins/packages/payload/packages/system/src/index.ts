export * from '@xyo-network/info-system-payload-plugins'

import { XyoSystemInfoPayloadPlugins } from '@xyo-network/info-system-payload-plugins'
import { XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

export const XyoSystemPlugins: XyoPayloadPluginFunc[] = [...XyoSystemInfoPayloadPlugins]

// eslint-disable-next-line import/no-default-export
export default XyoSystemPlugins
