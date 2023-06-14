export * from '@xyo-network/ethereum-blockchain-plugins'

import { EthereumPlugins } from '@xyo-network/ethereum-blockchain-plugins'
import { PayloadSetPluginFunc } from '@xyo-network/payloadset-plugin'

export const BlockchainPlugins: PayloadSetPluginFunc[] = [...EthereumPlugins]

// eslint-disable-next-line import/no-default-export
export default BlockchainPlugins
