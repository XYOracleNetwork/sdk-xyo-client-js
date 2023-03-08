import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
import type Emittery from 'emittery'

import { ModuleConfig } from '../Config'
import { ModuleEventData } from '../Events'
import { ModuleFilter } from '../ModuleFilter'
import { ModuleQueryResult } from '../ModuleQueryResult'
import { XyoQueryBoundWitness } from '../Query'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type XyoEmittery<TEventData = Record<EventName, any>> = Omit<Emittery<TEventData>, 'debug'>

export type EventName = PropertyKey

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventData = Record<EventName, any>

export interface EmitteryFunctions<TEventData extends EventData> {
  emit: Emittery<TEventData>['emit']
  off: Emittery<TEventData>['off']
  on: Emittery<TEventData>['on']
  once: Emittery<TEventData>['once']
}
export interface ModuleResolver {
  addResolver: (resolver: ModuleResolver) => this
  isModuleResolver: boolean
  removeResolver: (resolver: ModuleResolver) => this
  resolve<T extends Module = Module>(filter?: ModuleFilter): Promisable<T[]>
}

export type Module<TConfig extends ModuleConfig = ModuleConfig, TEventData extends EventData | undefined = undefined> = {
  address: string
  config: TConfig

  /* The resolver is a 'down' resolver.  It can resolve the module or any children (if it is a node for example), that are in the module*/
  readonly downResolver: ModuleResolver

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

  /* The resolver is a 'up' resolver.  It can resolve the parent or any children of the parent*/
  /* This is set by a NodeModule when attaching to the module */
  readonly upResolver: ModuleResolver
} & EmitteryFunctions<TEventData extends EventData ? TEventData & ModuleEventData : ModuleEventData>
