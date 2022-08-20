import { XyoPayload } from '../models'

export type XyoQuerySchema = 'network.xyo.query'
export const XyoQuerySchema: XyoQuerySchema = 'network.xyo.query'

export type XyoQueryPayload<T extends XyoPayload = XyoPayload, S extends string = T['schema']> = XyoPayload<
  T & {
    /** @field The maximum XYO that can be spent executing the query */
    budget?: number

    /** @field The frequency on which this query can be rerun */
    maxFrequency?: 'once' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year' | number

    /** @field The starting point for the bidding on the query */
    minBid?: number
  },
  S
>
