export * from '@xyo-network/gas-ethereum-blockchain-payload-plugins'

import { XyoEthereumGasPayloadPlugins } from '@xyo-network/gas-ethereum-blockchain-payload-plugins'
import { PayloadPluginFunc } from '@xyo-network/payload-plugin'

export const XyoEthereumPayloadPlugins: PayloadPluginFunc[] = [...XyoEthereumGasPayloadPlugins]

// eslint-disable-next-line import/no-default-export
export default XyoEthereumPayloadPlugins
