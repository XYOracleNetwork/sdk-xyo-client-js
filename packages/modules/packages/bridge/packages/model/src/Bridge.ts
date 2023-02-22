import { Module, ModuleConfig, ModuleFilter, ModuleQueryResult, XyoQuery, XyoQueryBoundWitness } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { BridgeConfig } from './Config'

export interface Bridge {
  connect: () => Promisable<boolean>
  disconnect: () => Promisable<boolean>
}

export interface BridgeModule<TConfig extends BridgeConfig = BridgeConfig> extends Bridge, Module<TConfig> {
  targetResolver: Module['resolver']
  targetDiscover(address?: string): Promisable<XyoPayload[]>
  targetQueries(address: string): string[]
  targetQuery(address: string, query: XyoQuery, payloads?: XyoPayload[]): Promisable<ModuleQueryResult>
  targetQueryable(address: string, query: XyoQueryBoundWitness, payloads?: XyoPayload[], queryConfig?: ModuleConfig): Promisable<boolean>
  targetResolve(address: string, filter?: ModuleFilter): Promisable<Module[]>
}
