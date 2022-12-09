export * from '@xyo-network/etherchain-gas-ethereum-blockchain-plugins'
export * from '@xyo-network/etherscan-ethereum-gas-plugin'

import { XyoEthereumGasEtherchainPlugins } from '@xyo-network/etherchain-gas-ethereum-blockchain-plugins'
import { XyoEthereumGasEtherscanPlugin } from '@xyo-network/etherscan-ethereum-gas-plugin'
import { PayloadSetPluginFunc } from '@xyo-network/payloadset-plugin'

export const XyoEthereumGasPlugins: PayloadSetPluginFunc[] = [...XyoEthereumGasEtherchainPlugins, XyoEthereumGasEtherscanPlugin]

// eslint-disable-next-line import/no-default-export
export default XyoEthereumGasPlugins
