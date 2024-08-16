import type { Address } from '@xylabs/hex'
import type { EmptyObject } from '@xylabs/object'
import type { BridgeConfig } from '@xyo-network/bridge-model'

import type { AsyncQueryBusClientConfig, AsyncQueryBusHostConfig } from './AsyncQueryBus/index.ts'
import { PubSubBridgeSchema } from './Schema.ts'

export const PubSubBridgeConfigSchema = `${PubSubBridgeSchema}.config` as const
export type PubSubBridgeConfigSchema = typeof PubSubBridgeConfigSchema

/**
 * Configuration for the PubSubBridge
 */
export type PubSubBridgeConfig<TConfig extends EmptyObject = EmptyObject, TSchema extends string | void = void> = BridgeConfig<
  {
    client?: AsyncQueryBusClientConfig
    host?: AsyncQueryBusHostConfig
    roots?: Address[]
  } & TConfig,
  TSchema extends string ? TSchema : PubSubBridgeConfigSchema
>
