import { XyoPayload } from '@xyo-network/payload'

import { XyoEthereumGasSchema } from './Schema'

export interface XyoEthereumGasPayload extends XyoPayload {
  price: string
  schema: XyoEthereumGasSchema
  timestamp: number
}
