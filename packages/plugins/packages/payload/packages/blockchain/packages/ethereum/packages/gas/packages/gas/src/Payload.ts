import { Payload } from '@xyo-network/payload-model'

import { FeeData } from './Model'
import { XyoEthereumGasSchema } from './Schema'

export type XyoEthereumGasPayload = Payload<
  FeeData & {
    schema: XyoEthereumGasSchema
    timestamp: number
  }
>
