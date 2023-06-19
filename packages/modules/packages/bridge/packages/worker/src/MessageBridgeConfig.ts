import { BridgeConfig } from '@xyo-network/bridge-model'
import { AnyObject } from '@xyo-network/core'

export type MessageBridgeConfigSchema = 'network.xyo.bridge.message.config'
export const MessageBridgeConfigSchema: MessageBridgeConfigSchema = 'network.xyo.bridge.message.config'

export type MessageBridgeConfig<TConfig extends AnyObject = AnyObject> = BridgeConfig<
  {
    schema: MessageBridgeConfigSchema
  } & TConfig
>
