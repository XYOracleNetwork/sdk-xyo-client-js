import { XyoPayload } from '@xyo-network/payload-model'

import { FeeData } from './Model'
import { XyoEthereumGasSchema } from './Schema'

export type XyoEthereumGasPayload = XyoPayload<
  FeeData & {
    schema: XyoEthereumGasSchema
    timestamp: number
  }
>
