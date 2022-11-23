import { XyoEthereumGasEthersPayload, XyoEthereumGasEthersSchema } from '@xyo-network/ethers-ethereum-gas-payload-plugin'
import { XyoPayload } from '@xyo-network/payload'

export const isXyoEthereumGasEthersPayload = (payload?: XyoPayload | null): payload is XyoEthereumGasEthersPayload => {
  return payload?.schema === XyoEthereumGasEthersSchema
}
