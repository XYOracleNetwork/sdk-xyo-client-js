import { XyoQueryBoundWitness } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

export type Queryable<T extends XyoQueryBoundWitness = XyoQueryBoundWitness> = (query: T, payloads?: XyoPayload[]) => Promisable<boolean>

export interface QueryValidator<T extends XyoQueryBoundWitness = XyoQueryBoundWitness> {
  queryable: Queryable<T>
}
