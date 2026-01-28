import type { EmptyObject } from '@xylabs/sdk-js'
import type { BridgeConfig } from '@xyo-network/bridge-model'
import type { Schema } from '@xyo-network/payload-model'
import { asSchema } from '@xyo-network/payload-model'

export const WebsocketBridgeConfigSchema = asSchema('network.xyo.bridge.websocket.config', true)
export type WebsocketBridgeConfigSchema = typeof WebsocketBridgeConfigSchema

export type WebsocketBridgeConfig<TConfig extends EmptyObject = EmptyObject, TSchema extends string | void = void> = BridgeConfig<
  {
    schema: WebsocketBridgeConfigSchema
  } & TConfig,
  TSchema extends Schema ? TSchema : WebsocketBridgeConfigSchema,
  {
    failureRetryTime?: number
    failureTimeCacheMax?: number
    maxConnections?: number
    maxPayloadSizeWarning?: number
    url: string
  },
  {
    port?: number
  }
>
