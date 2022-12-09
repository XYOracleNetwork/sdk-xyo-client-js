export * from '@xyo-network/ethereum-blockchain-payload-plugins'

import { XyoEthereumPayloadPlugins } from '@xyo-network/ethereum-blockchain-payload-plugins'
import { XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

export const XyoBlockchainPayloadPlugins: XyoPayloadPluginFunc[] = [...XyoEthereumPayloadPlugins]

// eslint-disable-next-line import/no-default-export
export default XyoBlockchainPayloadPlugins
