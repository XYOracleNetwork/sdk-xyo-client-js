import { WithAdditional } from '@xyo-network/core'
import { ModuleConfig } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'

export type XyoBridgeConfigSchema = 'network.xyo.bridge.config'
export const XyoBridgeConfigSchema: XyoBridgeConfigSchema = 'network.xyo.bridge.config'

export interface CacheConfig {
  max?: number
  ttl?: number
}

export type BridgeConfig<TConfig extends Payload | undefined = undefined> = ModuleConfig<
  WithAdditional<
    {
      discoverCache?: CacheConfig | true
      schema: TConfig extends Payload ? TConfig['schema'] : XyoBridgeConfigSchema
    },
    TConfig
  >
>
