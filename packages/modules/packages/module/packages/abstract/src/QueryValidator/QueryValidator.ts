import { QueryBoundWitness } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type Queryable<T extends QueryBoundWitness = QueryBoundWitness> = (query: T, payloads?: Payload[]) => boolean

export interface QueryValidator<T extends QueryBoundWitness = QueryBoundWitness> {
  queryable: Queryable<T>
}
