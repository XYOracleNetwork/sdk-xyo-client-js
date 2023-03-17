import { AnyObject } from '@xyo-network/core'
import { PayloadFindFilter } from '@xyo-network/payload-model'

/* Note: Added Omit to PayloadFindFilter for offset until we support hash based offsets */

export type PayloadFilterPredicate<T extends AnyObject = AnyObject> = Partial<{
  archives: string[]
  //hash: string
  offset: number
  schemas: string[]
}> &
  Omit<PayloadFindFilter, 'offset'> &
  Partial<T>
