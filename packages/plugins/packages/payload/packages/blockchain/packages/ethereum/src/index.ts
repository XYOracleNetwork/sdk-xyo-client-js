export * from '@xyo-network/gas-ethereum-blockchain-payload-plugins'

import { EthereumGasPayloadPlugins } from '@xyo-network/gas-ethereum-blockchain-payload-plugins'
import { PayloadPluginFunc } from '@xyo-network/payload-plugin'

export const EthereumPayloadPlugins: PayloadPluginFunc[] = [...EthereumGasPayloadPlugins]

// eslint-disable-next-line import/no-default-export
export default EthereumPayloadPlugins
