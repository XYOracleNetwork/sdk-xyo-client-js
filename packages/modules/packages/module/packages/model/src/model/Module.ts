import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { AbstractModuleConfig } from '../Config'
import { ModuleDescription } from '../ModuleDescription'
import { ModuleQueryResult } from '../ModuleQueryResult'
import { XyoQueryBoundWitness } from '../Query'

export interface Module<TConfig extends AbstractModuleConfig = AbstractModuleConfig> {
  address: string
  config: TConfig
  description: () => Promisable<ModuleDescription>
  queries: () => string[]
  query: <T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(
    query: T,
    payloads?: XyoPayload[],
    queryConfig?: TConfig,
  ) => Promisable<ModuleQueryResult>
  queryable: <T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[], queryConfig?: TConfig) => boolean
}
