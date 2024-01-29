import { EmptyObject } from '@xylabs/object'
import { BridgeConfig } from '@xyo-network/bridge-model'

export const PubSubBridgeConfigSchema = 'network.xyo.bridge.pubsub.config'
export type PubSubBridgeConfigSchema = typeof PubSubBridgeConfigSchema

export type PubSubBridgeConfig<TConfig extends EmptyObject = EmptyObject, TSchema extends string | void = void> = BridgeConfig<
  {
    nodeUrl?: string
    schema: PubSubBridgeConfigSchema
  } & TConfig,
  TSchema extends string ? TSchema : PubSubBridgeConfigSchema
>
