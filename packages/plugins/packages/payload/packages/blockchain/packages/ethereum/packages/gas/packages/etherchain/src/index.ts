import { XyoEthereumGasEtherchainV2PayloadPlugin } from '@xyo-network/etherchain-ethereum-gas-v2-payload-plugin'
import { PayloadPluginFunc } from '@xyo-network/payload-plugin'

export * from '@xyo-network/etherchain-ethereum-gas-v2-payload-plugin'

export const XyoEthereumGasEtherchainPayloadPlugins: PayloadPluginFunc[] = [XyoEthereumGasEtherchainV2PayloadPlugin]

// eslint-disable-next-line import/no-default-export
export default XyoEthereumGasEtherchainPayloadPlugins
