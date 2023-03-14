import {
  AnyConfigSchema,
  Module,
  ModuleConfig,
  ModuleFilter,
  ModuleParams,
  ModuleQueryResult,
  XyoQuery,
  XyoQueryBoundWitness,
} from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { BridgeConfig } from './Config'

export interface Bridge {
  connect: () => Promisable<boolean>
  disconnect: () => Promisable<boolean>
}

export type BridgeParams<TConfig extends AnyConfigSchema<BridgeConfig> = AnyConfigSchema<BridgeConfig>> = ModuleParams<TConfig>

export interface BridgeModule<TParams extends BridgeParams = BridgeParams, TModule extends Module = Module> extends Bridge, Module<TParams> {
  targetConfig(address: string): ModuleConfig
  targetDiscover(address?: string): Promisable<XyoPayload[] | undefined>
  targetDownResolver(address?: string): TModule['downResolver']
  targetQueries(address: string): string[]
  targetQuery(address: string, query: XyoQuery, payloads?: XyoPayload[]): Promisable<ModuleQueryResult | undefined>
  targetQueryable(address: string, query: XyoQueryBoundWitness, payloads?: XyoPayload[], queryConfig?: ModuleConfig): Promisable<boolean>
  targetResolve(address: string, filter?: ModuleFilter): Promisable<TModule[]>
}
