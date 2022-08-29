export * from '@xyo-network/blockchain-payload-plugins'
export * from '@xyo-network/system-payload-plugins'

import { XyoBlockchainPayloadPlugins } from '@xyo-network/blockchain-payload-plugins'
import { XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'
import { XyoSystemPayloadPlugins } from '@xyo-network/system-payload-plugins'

export const XyoPayloadPlugins: XyoPayloadPluginFunc[] = [...XyoSystemPayloadPlugins, ...XyoBlockchainPayloadPlugins]

// eslint-disable-next-line import/no-default-export
export default XyoPayloadPlugins
