import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { ModuleConfig } from '../Config'
import { ModuleFilter } from '../ModuleFilter'
import { ModuleQueryResult } from '../ModuleQueryResult'
import { XyoQueryBoundWitness } from '../Query'

export interface ModuleResolver<TModule extends Module = Module> {
  addResolver?: (resolver: ModuleResolver<TModule>) => this
  isModuleResolver: boolean
  removeResolver?: (resolver: ModuleResolver<TModule>) => this
  resolve(filter?: ModuleFilter): Promisable<TModule[]>
}

export interface Module<TConfig extends ModuleConfig = ModuleConfig> {
  address: string
  config: TConfig

  /* The resolver is a 'up' resolver.  It can resolve the module or any (public) children/peers/parents of the parent module*/
  parentResolver?: ModuleResolver

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

  /* Resolves a filter from the perspective of the module, including through the parent/gateway module */
  resolve: (filter?: ModuleFilter) => Promisable<Module[]>

  /* The resolver is a 'down' resolver.  It can resolve the module or any children (if it is a node for example), that are in the module*/
  resolver: ModuleResolver
}
