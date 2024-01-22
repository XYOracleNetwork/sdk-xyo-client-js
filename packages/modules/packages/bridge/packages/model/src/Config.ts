import { EmptyObject, WithAdditional } from '@xylabs/object'
import { ModuleConfig } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export const BridgeConfigSchema = 'network.xyo.bridge.config'
export type BridgeConfigSchema = typeof BridgeConfigSchema

export interface CacheConfig {
  max?: number
  ttl?: number
}

export type BridgeConfig<TConfig extends Payload | EmptyObject | undefined = undefined, TSchema extends string | void = void> = ModuleConfig<
  WithAdditional<
    {
      discoverCache?: CacheConfig | true
      maxDepth?: number
      schema: TConfig extends Payload ? TConfig['schema'] : BridgeConfigSchema
    },
    TConfig
  >,
  TSchema
>
