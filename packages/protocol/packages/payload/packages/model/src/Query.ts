import type { Address } from '@xylabs/hex'
import type { EmptyObject } from '@xylabs/object'

import type { Payload } from './Payload.ts'
import type { Schema, WithSchema } from './Schema.ts'

export interface QueryFields {
  /** @field The addresses of the intended handlers */
  address?: Address | Address[]

  /** @field The maximum XYO that can be spent executing the query */
  budget?: number

  /** @field The frequency on which this query can be rerun */
  maxFrequency?: 'once' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'

  /** @field The starting point for the bidding on the query */
  minBid?: number
}

export type Query<T extends void | EmptyObject | WithSchema = void, S extends Schema | void = void> = Payload<
  T extends void ? QueryFields : T & QueryFields,
  S extends void
    ? T extends WithSchema ? T['schema']
      : T extends void ? Schema
        : void
    : S
>
