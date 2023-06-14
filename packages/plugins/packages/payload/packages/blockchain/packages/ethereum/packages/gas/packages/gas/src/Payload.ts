import { Payload } from '@xyo-network/payload-model'

import { FeeData } from './Model'
import { EthereumGasSchema } from './Schema'

export type EthereumGasPayload = Payload<
  FeeData & {
    schema: EthereumGasSchema
    timestamp: number
  }
>
