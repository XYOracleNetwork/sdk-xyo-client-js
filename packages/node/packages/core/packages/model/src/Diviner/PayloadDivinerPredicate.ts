import { AnyObject } from '@xyo-network/core'

import { SortDirection } from '../sortDirection'

/* Note: Added Omit to PayloadFindDiviner for offset until we support hash based offsets */

export type PayloadDivinerPredicate<T extends AnyObject = AnyObject> = Partial<{
  address: string | string[]
  hash: string
  limit: number
  offset: number
  order: SortDirection
  schemas: string[]
}> &
  Partial<T>
