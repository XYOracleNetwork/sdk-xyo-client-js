import { EmptyObject, WithAdditional } from '@xylabs/object'
import { CacheConfig, ModuleConfig } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export const BridgeConfigSchema = 'network.xyo.bridge.config' as const
export type BridgeConfigSchema = typeof BridgeConfigSchema

export type BridgeClientConfig = {
  cache?: CacheConfig | true
  maxDepth?: number
}

export type BridgeHostConfig = {
  cache?: CacheConfig | true
  maxDepth?: number
}

export type BridgeConfig<
  TConfig extends Payload | EmptyObject | void = void,
  TSchema extends string | void = void,
  TClient extends EmptyObject | void = void,
  THost extends EmptyObject | void = void,
> = ModuleConfig<
  WithAdditional<
    {
      client?: WithAdditional<BridgeClientConfig, TClient>
      discoverRoots?: 'start' | 'lazy'
      host?: WithAdditional<BridgeHostConfig, THost>
      schema: TConfig extends Payload ? TConfig['schema'] : BridgeConfigSchema
    },
    TConfig
  >,
  TSchema
>
