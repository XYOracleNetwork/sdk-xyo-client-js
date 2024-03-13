import { EmptyObject, WithAdditional } from '@xylabs/object'
import { CacheConfig, ModuleConfig } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export const BridgeConfigSchema = 'network.xyo.bridge.config'
export type BridgeConfigSchema = typeof BridgeConfigSchema

export type BridgeConfig<TConfig extends Payload | EmptyObject | undefined = undefined, TSchema extends string | void = void> = ModuleConfig<
  WithAdditional<
    {
      discoverCache?: CacheConfig | true
      maxDepth?: number
      resolveCache?: CacheConfig
      schema: TConfig extends Payload ? TConfig['schema'] : BridgeConfigSchema
    },
    TConfig
  >,
  TSchema
>
