import { XyoQueryBoundWitness } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type Queryable<T extends XyoQueryBoundWitness = XyoQueryBoundWitness> = (query: T, payloads?: Payload[]) => boolean

export interface QueryValidator<T extends XyoQueryBoundWitness = XyoQueryBoundWitness> {
  queryable: Queryable<T>
}
