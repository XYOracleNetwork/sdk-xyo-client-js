import { EmptyObject } from '@xylabs/object'
import { Schema, Sequence } from '@xyo-network/payload-model'

import { Order } from './Order.ts'

export type PayloadDivinerPredicate<T extends EmptyObject = EmptyObject> = Partial<
  {
    cursor: Sequence
    limit: number
    order: Order
    schemas: Schema[]
  } & T
>
