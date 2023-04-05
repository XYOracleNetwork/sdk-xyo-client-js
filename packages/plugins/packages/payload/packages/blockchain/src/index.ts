export * from '@xyo-network/ethereum-blockchain-payload-plugins'

import { XyoEthereumPayloadPlugins } from '@xyo-network/ethereum-blockchain-payload-plugins'
import { PayloadPluginFunc } from '@xyo-network/payload-plugin'

export const XyoBlockchainPayloadPlugins: PayloadPluginFunc[] = [...XyoEthereumPayloadPlugins]

// eslint-disable-next-line import/no-default-export
export default XyoBlockchainPayloadPlugins
