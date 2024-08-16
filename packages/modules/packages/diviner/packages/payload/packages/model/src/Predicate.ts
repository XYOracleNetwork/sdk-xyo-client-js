import type { Address, Hash } from '@xylabs/hex'
import type { EmptyObject } from '@xylabs/object'
import type { Schema } from '@xyo-network/payload-model'

import type { Order } from './Order.ts'

/* Note: Added Omit to PayloadFindDiviner for offset until we support hash based offsets */

export type PayloadDivinerPredicate<T extends EmptyObject = EmptyObject, TOffset = number> = Partial<
  {
    /**
     * @deprecated Use BW Diviner to find signed Payloads matching desired
     * criteria, then get Payloads by hash directly from Archivist
     */
    address: Address | Address[]
    hash: Hash
    limit: number
    offset: TOffset
    order: Order
    schemas: Schema[]
    timestamp?: number
  } & T
>
