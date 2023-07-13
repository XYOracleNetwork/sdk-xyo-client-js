import { QueryBoundWitness } from '@xyo-network/boundwitness-builder'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

export type Queryable<T extends QueryBoundWitness = QueryBoundWitness> = (query: T, payloads?: Payload[]) => Promisable<boolean>

export interface QueryValidator<T extends QueryBoundWitness = QueryBoundWitness> {
  queryable: Queryable<T>
}
