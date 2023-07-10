import {
  AnyConfigSchema,
  Module,
  ModuleConfig,
  ModuleEventData,
  ModuleFilter,
  ModuleInstance,
  ModuleParams,
  ModuleQueryResult,
  Query,
  QueryBoundWitness,
} from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { BridgeConfig } from './Config'

export interface BridgeInstance {
  connect: () => Promisable<boolean>
  disconnect: () => Promisable<boolean>
}

/** @deprecated use BridgeInstance instead */
export type Bridge = BridgeInstance

export type BridgeParams<TConfig extends AnyConfigSchema<BridgeConfig> = AnyConfigSchema<BridgeConfig>> = ModuleParams<TConfig>

export interface BridgeModule<
  TParams extends BridgeParams = BridgeParams,
  TEventData extends ModuleEventData = ModuleEventData,
  TModule extends Module<ModuleParams, TEventData> = Module<ModuleParams, TEventData>,
> extends BridgeInstance,
    ModuleInstance<TParams, TEventData> {
  targetConfig(address: string): ModuleConfig
  targetDiscover(address?: string): Promisable<Payload[]>
  targetDownResolver(address?: string): TModule['downResolver']
  targetQueries(address: string): string[]
  targetQuery(address: string, query: Query, payloads?: Payload[]): Promisable<ModuleQueryResult>
  targetQueryable(address: string, query: QueryBoundWitness, payloads?: Payload[], queryConfig?: ModuleConfig): Promisable<boolean>
  targetResolve(address: string, filter?: ModuleFilter): Promisable<TModule[]>
}
