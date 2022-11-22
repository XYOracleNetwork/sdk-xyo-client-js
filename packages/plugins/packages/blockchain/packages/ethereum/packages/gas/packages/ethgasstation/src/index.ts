import { XyoEthereumGasEthgasstationV1PayloadPlugin } from '@xyo-network/ethgasstation-ethereum-gas-v1-payload-plugin'
import { XyoEthereumGasEthgasstationV2PayloadPlugin } from '@xyo-network/ethgasstation-ethereum-gas-v2-payload-plugin'
import { XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

export * from '@xyo-network/ethgasstation-ethereum-gas-v1-payload-plugin'
export * from '@xyo-network/ethgasstation-ethereum-gas-v2-payload-plugin'

export const XyoEthereumGasEthgasstationPayloadPlugins: XyoPayloadPluginFunc[] = [
  XyoEthereumGasEthgasstationV1PayloadPlugin,
  XyoEthereumGasEthgasstationV2PayloadPlugin,
]

// eslint-disable-next-line import/no-default-export
export default XyoEthereumGasEthgasstationPayloadPlugins
