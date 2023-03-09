import { Module, ModuleConfig, ModuleFilter, ModuleParams, ModuleQueryResult, XyoQuery, XyoQueryBoundWitness } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { BridgeConfig } from './Config'

export interface Bridge {
  connect: () => Promisable<boolean>
  disconnect: () => Promisable<boolean>
}

export type BridgeParams = ModuleParams<BridgeConfig>

export interface BridgeModule<TParams extends BridgeParams = BridgeParams, TModule extends Module = Module> extends Bridge, Module<TParams> {
  targetDownResolver: TModule['downResolver']
  targetConfig(address: string): XyoPayload
  targetDiscover(address?: string): Promisable<XyoPayload[] | undefined>
  targetQueries(address: string): string[]
  targetQuery(address: string, query: XyoQuery, payloads?: XyoPayload[]): Promisable<ModuleQueryResult | undefined>
  targetQueryable(address: string, query: XyoQueryBoundWitness, payloads?: XyoPayload[], queryConfig?: ModuleConfig): Promisable<boolean>
  targetResolve(address: string, filter?: ModuleFilter): Promisable<TModule[]>
}
