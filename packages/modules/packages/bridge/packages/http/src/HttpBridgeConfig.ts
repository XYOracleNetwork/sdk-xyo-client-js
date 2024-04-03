import { EmptyObject } from '@xylabs/object'
import { BridgeConfig } from '@xyo-network/bridge-model'

export type HttpBridgeConfigSchema = 'network.xyo.bridge.http.config'
export const HttpBridgeConfigSchema: HttpBridgeConfigSchema = 'network.xyo.bridge.http.config'

export type HttpBridgeConfig<TConfig extends EmptyObject = EmptyObject, TSchema extends string | void = void> = BridgeConfig<
  {
    discoverRoot?: boolean
    failureRetryTime?: number
    failureTimeCacheMax?: number
    maxConnections?: number
    maxPayloadSizeWarning?: number
    nodeUrl?: string
    schema: HttpBridgeConfigSchema
  } & TConfig,
  TSchema extends string ? TSchema : HttpBridgeConfigSchema
>
