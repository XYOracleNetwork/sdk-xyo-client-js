import { EmptyObject } from '@xyo-network/object'

import { SortDirection } from './SortDirection'

/* Note: Added Omit to PayloadFindDiviner for offset until we support hash based offsets */

export type PayloadDivinerPredicate<T extends EmptyObject = EmptyObject> = Partial<
  {
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
    timestamp?: number
  } & T
>
