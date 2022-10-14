import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { ModuleQueryResult } from './ModuleQueryResult'
import { XyoQueryBoundWitness } from './Query'

export interface Module {
  address: string
  queries: () => string[]
  queryable: (schema: string, addresses?: string[]) => boolean
  query: <T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]) => Promisable<ModuleQueryResult>
  start: (timeout?: number) => Promisable<unknown>
  stop: (timeout?: number) => Promisable<unknown>
}
