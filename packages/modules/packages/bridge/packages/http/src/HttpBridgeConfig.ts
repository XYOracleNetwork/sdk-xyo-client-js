import { BridgeConfig } from '@xyo-network/bridge-model'
import { AnyObject } from '@xyo-network/core'
import { Url } from 'url'

export type HttpBridgeConfigSchema = 'network.xyo.bridge.http.config'
export const HttpBridgeConfigSchema: HttpBridgeConfigSchema = 'network.xyo.bridge.http.config'

export type HttpBridgeConfig<TConfig extends AnyObject = AnyObject> = BridgeConfig<
  {
    nodeUrl?: string
    schema: HttpBridgeConfigSchema
  } & TConfig
>
