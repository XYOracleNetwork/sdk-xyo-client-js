import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { ModuleQueryResult } from './ModuleQueryResult'
import { XyoQueryBoundWitness } from './Query'

export interface Module<TConfig extends XyoPayload = XyoPayload> {
  address: string
  config: TConfig
  queries: () => string[]
  query: <T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]) => Promisable<ModuleQueryResult>
  queryable: (schema: string, addresses?: string[]) => boolean
}
