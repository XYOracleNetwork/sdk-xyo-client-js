export * from '@xyo-network/ethereum-blockchain-payload-plugins'

import { XyoEthereumPlugins } from '@xyo-network/ethereum-blockchain-payload-plugins'
import { PayloadSetPluginFunc } from '@xyo-network/payloadset-plugin'

export const XyoBlockchainPlugins: PayloadSetPluginFunc[] = [...XyoEthereumPlugins]

// eslint-disable-next-line import/no-default-export
export default XyoBlockchainPlugins
