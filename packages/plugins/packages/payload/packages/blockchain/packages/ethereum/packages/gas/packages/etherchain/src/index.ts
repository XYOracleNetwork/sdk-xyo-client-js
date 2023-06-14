import { EthereumGasEtherchainV2PayloadPlugin } from '@xyo-network/etherchain-ethereum-gas-v2-payload-plugin'
import { PayloadPluginFunc } from '@xyo-network/payload-plugin'

export * from '@xyo-network/etherchain-ethereum-gas-v2-payload-plugin'

export const EthereumGasEtherchainPayloadPlugins: PayloadPluginFunc[] = [EthereumGasEtherchainV2PayloadPlugin]

// eslint-disable-next-line import/no-default-export
export default EthereumGasEtherchainPayloadPlugins
