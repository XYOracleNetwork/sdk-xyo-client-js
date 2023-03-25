import { BoundWitness } from '@xyo-network/boundwitness-model'
import { EventArgs, EventData, EventFunctions } from '@xyo-network/module-events'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { ModuleConfig } from './Config'
import { ModuleFilter } from './ModuleFilter'
import { AnyConfigSchema, ModuleParams } from './ModuleParams'
import { ModuleQueryResult } from './ModuleQueryResult'
import { QueryBoundWitness } from './Query'

export interface ModuleResolver {
  addResolver: (resolver: ModuleResolver) => this
  isModuleResolver: boolean
  removeResolver: (resolver: ModuleResolver) => this
  resolve<T extends Module = Module>(filter?: ModuleFilter): Promisable<T[]>
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
    result: [BoundWitness, Payload[]]
  }
>

export interface ModuleEventData extends EventData {
  moduleQueried: ModuleQueriedEventArgs
}

export type ModuleFields<TParams extends ModuleParams<AnyConfigSchema<ModuleConfig>> = ModuleParams<AnyConfigSchema<ModuleConfig>>> = {
  address: string
  config: TParams['config']

  /* The resolver is a 'down' resolver.  It can resolve the module or any children (if it is a node for example), that are in the module*/
  readonly downResolver: ModuleResolver

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
