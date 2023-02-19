import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { ModuleConfig } from '../Config'
import { ModuleFilter } from '../ModuleFilter'
import { ModuleQueryResult } from '../ModuleQueryResult'
import { XyoQueryBoundWitness } from '../Query'

export interface ModuleResolver<TModule extends Module = Module> {
  isModuleResolver: boolean
  resolve(filter?: ModuleFilter): Promisable<TModule[]>
}

export interface Module<TConfig extends ModuleConfig = ModuleConfig> {
  address: string
  config: TConfig
  queries: string[]
  query: <T extends XyoQueryBoundWitness = XyoQueryBoundWitness, TConf extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: XyoPayload[],
    queryConfig?: TConf,
  ) => Promisable<ModuleQueryResult>
  queryable: <T extends XyoQueryBoundWitness = XyoQueryBoundWitness, TConf extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: XyoPayload[],
    queryConfig?: TConf,
  ) => Promisable<boolean>
  resolve: (filter?: ModuleFilter) => Promisable<Module[]>
  resolver?: ModuleResolver
}
