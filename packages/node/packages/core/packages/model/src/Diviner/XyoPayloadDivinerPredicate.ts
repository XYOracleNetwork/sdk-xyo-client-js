import { AnyObject } from '@xyo-network/core'

import { SortDirection } from '../sortDirection'

/* Note: Added Omit to XyoPayloadFindDiviner for offset until we support hash based offsets */

export type XyoPayloadDivinerPredicate<T extends AnyObject = AnyObject> = Partial<{
  archives: string[]
  hash: string
  limit: number
  offset: number
  order: SortDirection
  schemas: string[]
}> &
  Partial<T>
