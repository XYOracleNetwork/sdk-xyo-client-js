import { XyoEthereumGasEthersPayload, XyoEthereumGasEthersSchema } from '@xyo-network/ethers-ethereum-gas-payload-plugin'
import { Payload } from '@xyo-network/payload-model'

export const isXyoEthereumGasEthersPayload = (payload?: Payload | null): payload is XyoEthereumGasEthersPayload => {
  return payload?.schema === XyoEthereumGasEthersSchema
}
