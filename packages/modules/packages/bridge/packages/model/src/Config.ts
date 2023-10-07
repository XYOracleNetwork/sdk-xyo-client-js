import { WithAdditional } from '@xyo-network/core'
import { ModuleConfig } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type BridgeConfigSchema = 'network.xyo.bridge.config'
export const BridgeConfigSchema: BridgeConfigSchema = 'network.xyo.bridge.config'

export interface CacheConfig {
  max?: number
  ttl?: number
}

export type BridgeConfig<TConfig extends Payload | undefined = undefined> = ModuleConfig<
  WithAdditional<
    {
      discoverCache?: CacheConfig | true
      maxDepth?: number
      schema: TConfig extends Payload ? TConfig['schema'] : BridgeConfigSchema
    },
    TConfig
  >
>
