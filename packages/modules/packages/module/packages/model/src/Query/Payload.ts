import { Payload } from '@xyo-network/payload-model'

export interface QueryFields {
  /** @field The addresses of the intended handlers */
  address?: string | [string]

  /** @field The maximum XYO that can be spent executing the query */
  budget?: number

  /** @field The frequency on which this query can be rerun */
  maxFrequency?: 'once' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'

  /** @field The starting point for the bidding on the query */
  minBid?: number
}

export type Query<T extends Payload | void = void> = T extends Payload ? Payload<T & QueryFields> : Payload<QueryFields>
