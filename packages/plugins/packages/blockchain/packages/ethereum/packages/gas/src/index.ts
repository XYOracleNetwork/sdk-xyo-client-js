export * from '@xyo-network/etherchain-gas-ethereum-blockchain-payload-plugins'
export * from '@xyo-network/etherscan-ethereum-gas-payload-plugin'

import { XyoEthereumGasEtherchainPlugins } from '@xyo-network/etherchain-gas-ethereum-blockchain-payload-plugins'
import { XyoEthereumGasEtherscanPlugin } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'
import { PayloadSetPluginFunc } from '@xyo-network/payloadset-plugin'

export const XyoEthereumGasPlugins: PayloadSetPluginFunc[] = [...XyoEthereumGasEtherchainPlugins, XyoEthereumGasEtherscanPlugin]

// eslint-disable-next-line import/no-default-export
export default XyoEthereumGasPlugins
