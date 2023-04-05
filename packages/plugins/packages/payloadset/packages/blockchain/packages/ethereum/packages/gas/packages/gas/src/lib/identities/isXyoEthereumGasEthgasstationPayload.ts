import { XyoEthereumGasEthgasstationPayload, XyoEthereumGasEthgasstationSchema } from '@xyo-network/ethgasstation-ethereum-gas-payload-plugin'
import { Payload } from '@xyo-network/payload-model'

export const isXyoEthereumGasEthgasstationPayload = (payload?: Payload | null): payload is XyoEthereumGasEthgasstationPayload => {
  return payload?.schema === XyoEthereumGasEthgasstationSchema
}
