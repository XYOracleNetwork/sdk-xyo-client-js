import { XyoPayload } from '@xyo-network/payload'

import { TransactionCosts } from './Model'
import { XyoEthereumGasSchema } from './Schema'

export type XyoEthereumGasPayload = XyoPayload<
  TransactionCosts & {
    schema: XyoEthereumGasSchema
    timestamp: number
  }
>
