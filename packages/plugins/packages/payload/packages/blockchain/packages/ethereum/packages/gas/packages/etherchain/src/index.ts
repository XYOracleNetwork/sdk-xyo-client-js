import { XyoEthereumGasEtherchainV2PayloadPlugin } from '@xyo-network/etherchain-ethereum-gas-v2-payload-plugin'
import { XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

export * from '@xyo-network/etherchain-ethereum-gas-v2-payload-plugin'

export const XyoEthereumGasEtherchainPayloadPlugins: XyoPayloadPluginFunc[] = [XyoEthereumGasEtherchainV2PayloadPlugin]

// eslint-disable-next-line import/no-default-export
export default XyoEthereumGasEtherchainPayloadPlugins
