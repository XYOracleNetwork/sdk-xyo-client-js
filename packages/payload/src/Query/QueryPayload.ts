import { EmptyObject } from '@xyo-network/core'

import { XyoPayload } from '../models'

export type XyoQueryPayload<T extends EmptyObject = EmptyObject> = XyoPayload<{
  /** @field The preferred schema to use for the answer */
  targetSchema?: string

  /** @field The maximum XYO that can be spent executing the query */
  budget?: number

  /** @field The frequency on which this query can be rerun */
  maxFrequency?: 'once' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'

  /** @field The starting point for the bidding on the query */
  minBid?: number
}> &
  T
