export * from '@xyo-network/gas-ethereum-blockchain-plugins'

import { EthereumGasPlugins } from '@xyo-network/gas-ethereum-blockchain-plugins'
import { PayloadSetPluginFunc } from '@xyo-network/payloadset-plugin'

export const EthereumPlugins: PayloadSetPluginFunc[] = [...EthereumGasPlugins]

// eslint-disable-next-line import/no-default-export
export default EthereumPlugins
