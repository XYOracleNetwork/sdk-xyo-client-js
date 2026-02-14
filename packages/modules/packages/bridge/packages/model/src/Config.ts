import type { EmptyObject, WithAdditional } from '@xylabs/sdk-js'
import type { CacheConfig, ModuleConfig } from '@xyo-network/module-model'
import type {
  Payload,
  Schema,
} from '@xyo-network/payload-model'
import { asSchema } from '@xyo-network/payload-model'

export const BridgeConfigSchema = asSchema('network.xyo.bridge.config', true)
export type BridgeConfigSchema = typeof BridgeConfigSchema

export type BridgeClientConfig = {
  cache?: CacheConfig | true
  discoverRoots?: 'start' | 'lazy'
  maxDepth?: number
}

export type BridgeHostConfig = {
  cache?: CacheConfig | true
  maxDepth?: number
}

export type BridgeConfig<
  TConfig extends Payload | EmptyObject | void = void,
  TSchema extends Schema | void = void,
  TClient extends EmptyObject | void = void,
  THost extends EmptyObject | void = void,
> = ModuleConfig<
  WithAdditional<
    {
      client?: WithAdditional<BridgeClientConfig, TClient>
      host?: WithAdditional<BridgeHostConfig, THost>
      schema: TConfig extends Payload ? TConfig['schema'] : BridgeConfigSchema
    },
    TConfig
  >,
  TSchema
>
