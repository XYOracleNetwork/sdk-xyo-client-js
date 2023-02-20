import { XyoPayload } from '@xyo-network/payload-model'

import { BridgeConfig } from './Config'

export type HttpBridgeConfigSchema = 'network.xyo.bridge.http.config'
export const HttpBridgeConfigSchema: HttpBridgeConfigSchema = 'network.xyo.bridge.http.config'

export type HttpBridgeConfig<TConfig extends XyoPayload = XyoPayload> = BridgeConfig<
  {
    nodeUri: string
    schema: HttpBridgeConfigSchema
    targetAddress?: string
  } & TConfig
>
