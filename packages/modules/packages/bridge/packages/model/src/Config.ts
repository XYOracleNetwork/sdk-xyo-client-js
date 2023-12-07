import { ModuleConfig } from '@xyo-network/module-model'
import { EmptyObject } from '@xyo-network/object'
import { Payload } from '@xyo-network/payload-model'

export type BridgeConfigSchema = 'network.xyo.bridge.config'
export const BridgeConfigSchema: BridgeConfigSchema = 'network.xyo.bridge.config'

export interface CacheConfig {
  max?: number
  ttl?: number
}

export type BridgeConfig<TConfig extends Payload | EmptyObject | undefined = undefined, TSchema extends string | void = void> = ModuleConfig<
  {
    discoverCache?: CacheConfig | true
    maxDepth?: number
    schema: TSchema extends string ? TSchema : BridgeConfigSchema
  },
  TConfig,
  TConfig extends Payload ? TConfig['schema'] : BridgeConfigSchema
>
