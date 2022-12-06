export * from '@xyo-network/gas-ethereum-blockchain-payload-plugins'

import { XyoEthereumGasPlugins } from '@xyo-network/gas-ethereum-blockchain-payload-plugins'
import { PayloadSetPluginFunc } from '@xyo-network/payloadset-plugin'

export const XyoEthereumPlugins: PayloadSetPluginFunc[] = [...XyoEthereumGasPlugins]

// eslint-disable-next-line import/no-default-export
export default XyoEthereumPlugins
