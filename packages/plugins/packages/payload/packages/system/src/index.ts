export * from '@xyo-network/info-system-payload-plugins'

import { XyoSystemInfoPayloadPlugins } from '@xyo-network/info-system-payload-plugins'
import { PayloadPluginFunc } from '@xyo-network/payload-plugin'

export const XyoSystemPlugins: PayloadPluginFunc[] = [...XyoSystemInfoPayloadPlugins]

// eslint-disable-next-line import/no-default-export
export default XyoSystemPlugins
