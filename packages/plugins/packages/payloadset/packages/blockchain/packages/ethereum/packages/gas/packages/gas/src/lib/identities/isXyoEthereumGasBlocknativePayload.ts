import { XyoEthereumGasBlocknativePayload, XyoEthereumGasBlocknativeSchema } from '@xyo-network/blocknative-ethereum-gas-payload-plugin'
import { Payload } from '@xyo-network/payload-model'

export const isXyoEthereumGasBlocknativePayload = (payload?: Payload | null): payload is XyoEthereumGasBlocknativePayload => {
  return payload?.schema === XyoEthereumGasBlocknativeSchema
}
