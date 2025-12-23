import type { EmptyObject } from '@xylabs/sdk-js'
import type { Schema, Sequence } from '@xyo-network/payload-model'

import type { Order } from './Order.ts'

export type PayloadDivinerPredicate<T extends EmptyObject = EmptyObject> = Partial<
  {
    cursor: Sequence
    limit: number
    order: Order
    schemas: Schema[]
  } & T
>
