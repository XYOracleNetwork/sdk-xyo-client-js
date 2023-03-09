import { AnyConfigSchema, Module, ModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { SentinelConfig } from './Config'

export interface Sentinel {
  report: (payloads?: XyoPayload[]) => Promisable<XyoPayload[]>
}

export type SentinelParams<TConfig extends AnyConfigSchema<SentinelConfig> = SentinelConfig> = ModuleParams<TConfig>

export type SentinelModule<TParams extends SentinelParams<AnyConfigSchema<SentinelConfig>> = SentinelParams> = Module<TParams> & Sentinel
