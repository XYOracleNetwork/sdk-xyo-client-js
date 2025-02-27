import type { Promisable } from '@xylabs/promise'
import type { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import type { Payload } from '@xyo-network/payload-model'

export type Queryable<T extends QueryBoundWitness = QueryBoundWitness> = (query: T, payloads?: Payload[]) => Promisable<boolean>

export interface QueryValidator<T extends QueryBoundWitness = QueryBoundWitness> {
  queryable: Queryable<T>
}
