export * from '@xyo-network/ethereum-blockchain-payload-plugins'

import { EthereumPayloadPlugins } from '@xyo-network/ethereum-blockchain-payload-plugins'
import { PayloadPluginFunc } from '@xyo-network/payload-plugin'

export const BlockchainPayloadPlugins: PayloadPluginFunc[] = [...EthereumPayloadPlugins]

// eslint-disable-next-line import/no-default-export
export default BlockchainPayloadPlugins
