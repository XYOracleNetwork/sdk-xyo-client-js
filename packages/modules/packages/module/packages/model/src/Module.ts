import { AccountInstance } from '@xyo-network/account-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { EventArgs, EventData, EventFunctions } from '@xyo-network/module-events'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { AnyConfigSchema, ModuleConfig } from './Config'
import { ModuleFilter } from './ModuleFilter'
import { ModuleParams } from './ModuleParams'
import { ModuleQueryResult } from './ModuleQueryResult'
import { QueryBoundWitness } from './Query'

export interface ModuleResolver {
  addResolver: (resolver: ModuleResolver) => this
  isModuleResolver: boolean
  removeResolver: (resolver: ModuleResolver) => this
  /**
   * Resolves all modules matching the supplied filter. If no filter
   * is supplied, all modules are returned
   * @param filter Filter criteria for the desired modules
   */
  resolve<T extends Module = Module>(filter?: ModuleFilter): Promisable<T[]>
  /**
   * Resolves a single module, or undefined if no modules matched the filter.
   * @param filter The desired Module's Address or Name
   */
  resolveOne<T extends Module = Module>(filter: string): Promisable<T | undefined>
}

export type ModuleEventArgs<TModule extends Module = Module, TArgs extends EventArgs | undefined = undefined> = TArgs extends EventArgs
  ? {
      module: TModule
    } & TArgs
  : {
      module: TModule
    }

export type ModuleQueriedEventArgs = ModuleEventArgs<
  Module,
  {
    payloads?: Payload[]
    query: QueryBoundWitness
    result: ModuleQueryResult
  }
>

export interface ModuleEventData extends EventData {
  moduleQueried: ModuleQueriedEventArgs
}

export type ModuleFields<TParams extends ModuleParams<AnyConfigSchema<ModuleConfig>> = ModuleParams<AnyConfigSchema<ModuleConfig>>> = {
  account?: AccountInstance
  address: string
  config: TParams['config']

  /* The resolver is a 'down' resolver.  It can resolve the module or any children (if it is a node for example), that are in the module*/
  readonly downResolver: ModuleResolver

  loadAccount?: () => Promisable<AccountInstance>

  params: TParams

  queries: string[]
  query: <T extends QueryBoundWitness = QueryBoundWitness, TConf extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConf,
  ) => Promisable<ModuleQueryResult>
  queryable: <T extends QueryBoundWitness = QueryBoundWitness, TConf extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConf,
  ) => Promisable<boolean>

  start?: () => Promisable<void>

  /* The resolver is a 'up' resolver.  It can resolve the parent or any children of the parent*/
  /* This is set by a NodeModule when attaching to the module */
  readonly upResolver: ModuleResolver
}

export type Module<
  TParams extends ModuleParams<AnyConfigSchema<ModuleConfig>> = ModuleParams<AnyConfigSchema<ModuleConfig>>,
  TEventData extends ModuleEventData = ModuleEventData,
> = ModuleFields<TParams> & EventFunctions<TEventData>
