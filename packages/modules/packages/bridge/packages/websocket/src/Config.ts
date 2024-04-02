import { EmptyObject } from '@xylabs/object'
import { BridgeConfig } from '@xyo-network/bridge-model'

export const WebsocketBridgeConfigSchema = 'network.xyo.bridge.websocket.config'
export type WebsocketBridgeConfigSchema = typeof WebsocketBridgeConfigSchema

export type WebsocketBridgeConfig<TConfig extends EmptyObject = EmptyObject, TSchema extends string | void = void> = BridgeConfig<
  {
    discoverRoot?: boolean
    /** @deprecated Do not use this for any new development */
    legacyMode?: boolean
    schema: WebsocketBridgeConfigSchema
    url?: string
  } & TConfig,
  TSchema extends string ? TSchema : WebsocketBridgeConfigSchema
>
