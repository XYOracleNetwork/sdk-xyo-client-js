export * from '@xyo-network/etherchain-gas-ethereum-blockchain-plugins'
export * from '@xyo-network/etherscan-ethereum-gas-plugin'

import { EthereumGasEtherchainPlugins } from '@xyo-network/etherchain-gas-ethereum-blockchain-plugins'
import { EthereumGasEtherscanPlugin } from '@xyo-network/etherscan-ethereum-gas-plugin'
import { PayloadSetPluginFunc } from '@xyo-network/payloadset-plugin'

export const EthereumGasPlugins: PayloadSetPluginFunc[] = [...EthereumGasEtherchainPlugins, EthereumGasEtherscanPlugin]

// eslint-disable-next-line import/no-default-export
export default EthereumGasPlugins
