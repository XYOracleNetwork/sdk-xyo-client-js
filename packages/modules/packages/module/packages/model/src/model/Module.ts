import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { AbstractModuleConfig } from '../Config'
import { ModuleFilter } from '../ModuleFilter'
import { ModuleQueryResult } from '../ModuleQueryResult'
import { XyoQueryBoundWitness } from '../Query'
import { ModuleResolver } from './ModuleResolver'

export interface Module<TConfig extends AbstractModuleConfig = AbstractModuleConfig> {
  address: string
  config: TConfig
  queries: string[]
  query: <T extends XyoQueryBoundWitness = XyoQueryBoundWitness, TConf extends AbstractModuleConfig = AbstractModuleConfig>(
    query: T,
    payloads?: XyoPayload[],
    queryConfig?: TConf,
  ) => Promisable<ModuleQueryResult>
  queryable: <T extends XyoQueryBoundWitness = XyoQueryBoundWitness, TConf extends AbstractModuleConfig = AbstractModuleConfig>(
    query: T,
    payloads?: XyoPayload[],
    queryConfig?: TConf,
  ) => Promisable<boolean>
  resolve: (filter?: ModuleFilter) => Promisable<Module[]>
  resolver?: ModuleResolver
}
