import { EmptyObject } from '@xylabs/object'
import { BridgeConfig } from '@xyo-network/bridge-model'

import { AsyncQueryBusClientConfig, AsyncQueryBusHostConfig } from './AsyncQueryBus'
import { PubSubBridgeSchema } from './Schema'

export const PubSubBridgeConfigSchema = `${PubSubBridgeSchema}.config`
export type PubSubBridgeConfigSchema = typeof PubSubBridgeConfigSchema

/**
 * Configuration for the PubSubBridge
 */
export type PubSubBridgeConfig<TConfig extends EmptyObject = EmptyObject, TSchema extends string | void = void> = BridgeConfig<
  {
    client?: AsyncQueryBusClientConfig
    host?: AsyncQueryBusHostConfig
  } & TConfig,
  TSchema extends string ? TSchema : PubSubBridgeConfigSchema
>
