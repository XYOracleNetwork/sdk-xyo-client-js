import { BridgeConfig } from '@xyo-network/bridge-model'
import { XyoPayload } from '@xyo-network/payload-model'

export type HttpBridgeConfigSchema = 'network.xyo.bridge.http.config'
export const HttpBridgeConfigSchema: HttpBridgeConfigSchema = 'network.xyo.bridge.http.config'

export type HttpBridgeConfig<TConfig extends XyoPayload = XyoPayload> = BridgeConfig<
  {
    nodeUri: string
    schema: HttpBridgeConfigSchema
  } & TConfig
>
