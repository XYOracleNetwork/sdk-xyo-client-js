import { BridgeConfig } from '@xyo-network/bridge-model'
import { AnyObject } from '@xyo-network/core'

export type HttpBridgeConfigSchema = 'network.xyo.bridge.http.config'
export const HttpBridgeConfigSchema: HttpBridgeConfigSchema = 'network.xyo.bridge.http.config'

export type HttpBridgeConfig<TConfig extends AnyObject = AnyObject> = BridgeConfig<
  {
    nodeUri?: string
    schema: HttpBridgeConfigSchema
  } & TConfig
>
