import { EmptyObject } from '@xyo-network/core'
import { XyoPayloadFindFilter } from '@xyo-network/payload'

/* Note: Added Omit to XyoPayloadFindFilter for offset until we support hash based offsets */

export type XyoPayloadFilterPredicate<T extends EmptyObject = EmptyObject> = Partial<{
  archives: string[]
  hash: string
  offset: number
  schemas: string[]
}> &
  Omit<XyoPayloadFindFilter, 'offset'> &
  Partial<T>
