import type { EmptyObject } from '@xylabs/object'
import type { BridgeConfig } from '@xyo-network/bridge-model'

export const HttpBridgeConfigSchema = 'network.xyo.bridge.http.config' as const
export type HttpBridgeConfigSchema = typeof HttpBridgeConfigSchema

export type HttpBridgeConfig<TConfig extends EmptyObject = EmptyObject, TSchema extends string | void = void> = BridgeConfig<
  {
    client?: BridgeConfig['client'] & {
      url: string
    }
    failureRetryTime?: number
    failureTimeCacheMax?: number
    host?: {
      port: number
    }
    maxConnections?: number
    maxPayloadSizeWarning?: number
    /** @deprecated use client.url instead */
    nodeUrl?: string
    schema: HttpBridgeConfigSchema
  } & TConfig,
  TSchema extends string ? TSchema : HttpBridgeConfigSchema
>
