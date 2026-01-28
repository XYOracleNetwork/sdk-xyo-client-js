import type { Address, EmptyObject } from '@xylabs/sdk-js'
import type { BridgeConfig } from '@xyo-network/bridge-model'
import type { Schema } from '@xyo-network/payload-model'
import { asSchema } from '@xyo-network/payload-model'

import type { AsyncQueryBusClientConfig, AsyncQueryBusHostConfig } from './AsyncQueryBus/index.ts'
import { PubSubBridgeSchema } from './Schema.ts'

export const PubSubBridgeConfigSchema = asSchema(`${PubSubBridgeSchema}.config`, true)
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
  TSchema extends Schema ? TSchema : PubSubBridgeConfigSchema
>
