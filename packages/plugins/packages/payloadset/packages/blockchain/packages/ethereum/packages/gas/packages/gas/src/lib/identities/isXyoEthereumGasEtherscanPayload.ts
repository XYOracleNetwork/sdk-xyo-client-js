import { XyoEthereumGasEtherscanPayload, XyoEthereumGasEtherscanSchema } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'
import { XyoPayload } from '@xyo-network/payload'

export const isXyoEthereumGasEtherscanPayload = (payload?: XyoPayload | null): payload is XyoEthereumGasEtherscanPayload => {
  return payload?.schema === XyoEthereumGasEtherscanSchema
}
