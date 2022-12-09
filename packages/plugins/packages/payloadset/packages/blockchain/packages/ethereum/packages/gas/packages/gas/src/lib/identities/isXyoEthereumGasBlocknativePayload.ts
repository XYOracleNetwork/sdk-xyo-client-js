import { XyoEthereumGasBlocknativePayload, XyoEthereumGasBlocknativeSchema } from '@xyo-network/blocknative-ethereum-gas-payload-plugin'
import { XyoPayload } from '@xyo-network/payload'

export const isXyoEthereumGasBlocknativePayload = (payload?: XyoPayload | null): payload is XyoEthereumGasBlocknativePayload => {
  return payload?.schema === XyoEthereumGasBlocknativeSchema
}
