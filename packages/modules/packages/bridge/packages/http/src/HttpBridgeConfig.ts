import { BridgeConfig } from '@xyo-network/bridge-model'
import { EmptyObject } from '@xyo-network/object'

export type HttpBridgeConfigSchema = 'network.xyo.bridge.http.config'
export const HttpBridgeConfigSchema: HttpBridgeConfigSchema = 'network.xyo.bridge.http.config'

export type HttpBridgeConfig<TConfig extends EmptyObject = EmptyObject, TSchema extends string | void = void> = BridgeConfig<
  {
    nodeUrl?: string
    schema: HttpBridgeConfigSchema
  } & TConfig,
  TSchema extends string ? TSchema : HttpBridgeConfigSchema
>
