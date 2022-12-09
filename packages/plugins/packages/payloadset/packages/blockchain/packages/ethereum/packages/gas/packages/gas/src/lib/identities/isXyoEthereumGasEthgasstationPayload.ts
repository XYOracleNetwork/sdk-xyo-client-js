import { XyoEthereumGasEthgasstationPayload, XyoEthereumGasEthgasstationSchema } from '@xyo-network/ethgasstation-ethereum-gas-payload-plugin'
import { XyoPayload } from '@xyo-network/payload'

export const isXyoEthereumGasEthgasstationPayload = (payload?: XyoPayload | null): payload is XyoEthereumGasEthgasstationPayload => {
  return payload?.schema === XyoEthereumGasEthgasstationSchema
}
