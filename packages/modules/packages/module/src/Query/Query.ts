import { XyoPayload } from '@xyo-network/payload'

export type XyoQueryPayload<T extends XyoPayload = XyoPayload, TSchema extends string = string> = XyoPayload<
  T & {
    /** @field The maximum XYO that can be spent executing the query */
    budget?: number

    /** @field The frequency on which this query can be rerun */
    maxFrequency?: 'once' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'

    /** @field The starting point for the bidding on the query */
    minBid?: number
  },
  TSchema
>
