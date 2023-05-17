import { AnyObject } from '@xyo-network/core'

import { SortDirection } from './SortDirection'

/* Note: Added Omit to PayloadFindDiviner for offset until we support hash based offsets */

export type PayloadDivinerPredicate<T extends AnyObject = AnyObject> = Partial<{
  /**
   * @deprecated Use BW Diviner to find signed Payloads matching desired
   * criteria, then get Payloads by hash directly from Archivist
   */
  address: string | string[]
  hash: string
  limit: number
  offset: number
  order: SortDirection
  schemas: string[]
}> &
  Partial<T>
