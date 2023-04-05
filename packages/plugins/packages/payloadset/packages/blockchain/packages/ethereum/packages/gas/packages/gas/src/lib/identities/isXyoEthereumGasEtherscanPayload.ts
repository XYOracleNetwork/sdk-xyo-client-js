import { XyoEthereumGasEtherscanPayload, XyoEthereumGasEtherscanSchema } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'
import { Payload } from '@xyo-network/payload-model'

export const isXyoEthereumGasEtherscanPayload = (payload?: Payload | null): payload is XyoEthereumGasEtherscanPayload => {
  return payload?.schema === XyoEthereumGasEtherscanSchema
}
