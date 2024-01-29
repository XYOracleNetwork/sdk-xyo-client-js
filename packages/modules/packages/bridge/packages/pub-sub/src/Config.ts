import { EmptyObject } from '@xylabs/object'
import { BridgeConfig } from '@xyo-network/bridge-model'

import { PubSubBridgeSchema } from './Schema'

export const PubSubBridgeConfigSchema = `${PubSubBridgeSchema}.config`
export type PubSubBridgeConfigSchema = typeof PubSubBridgeConfigSchema

interface CacheModuleConfig {
  archivist: string
  boundWitnessDiviner: string
}

export type PubSubBridgeConfig<TConfig extends EmptyObject = EmptyObject, TSchema extends string | void = void> = BridgeConfig<
  {
    bridge?: string
    queryCache?: CacheModuleConfig
    responseCache?: CacheModuleConfig
    schema: PubSubBridgeConfigSchema
  } & TConfig,
  TSchema extends string ? TSchema : PubSubBridgeConfigSchema
>
