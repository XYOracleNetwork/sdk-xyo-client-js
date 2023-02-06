import { XyoEthereumGasEtherchainV2Plugin } from '@xyo-network/etherchain-ethereum-gas-v2-plugin'
import { PayloadSetPluginFunc } from '@xyo-network/payloadset-plugin'

export * from '@xyo-network/etherchain-ethereum-gas-v2-plugin'

export const XyoEthereumGasEtherchainPlugins: PayloadSetPluginFunc[] = [XyoEthereumGasEtherchainV1Plugin, XyoEthereumGasEtherchainV2Plugin]

// eslint-disable-next-line import/no-default-export
export default XyoEthereumGasEtherchainPlugins
