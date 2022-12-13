import { EmptyObject } from '@xyo-network/core'
import { PayloadFindFilter } from '@xyo-network/payload'

/* Note: Added Omit to PayloadFindFilter for offset until we support hash based offsets */

export type XyoPayloadFilterPredicate<T extends EmptyObject = EmptyObject> = Partial<{
  archives: string[]
  hash: string
  offset: number
  schemas: string[]
}> &
  Omit<PayloadFindFilter, 'offset'> &
  Partial<T>
