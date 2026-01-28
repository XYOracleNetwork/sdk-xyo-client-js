import type { EmptyObject } from '@xylabs/sdk-js'
import type { BridgeConfig } from '@xyo-network/bridge-model'
import type { Schema } from '@xyo-network/payload-model'
import { asSchema } from '@xyo-network/payload-model'

export const HttpBridgeConfigSchema = asSchema('network.xyo.bridge.http.config', true)
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
  TSchema extends Schema ? TSchema : HttpBridgeConfigSchema
>
