import { Promisable } from '@xylabs/promise'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { Payload } from '@xyo-network/payload-model'

export type Queryable<T extends QueryBoundWitness = QueryBoundWitness> = (query: T, payloads?: Payload[]) => Promisable<boolean>

export interface QueryValidator<T extends QueryBoundWitness = QueryBoundWitness> {
  queryable: Queryable<T>
}
