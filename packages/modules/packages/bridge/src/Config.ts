import { XyoModuleConfig } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

export type XyoBridgeConfigSchema = 'network.xyo.bridge.config'
export const XyoBridgeConfigSchema: XyoBridgeConfigSchema = 'network.xyo.bridge.config'

export type XyoBridgeConfig<TConfig extends XyoPayload = XyoPayload> = XyoModuleConfig<
  {
    nodeUri: string
    targetAddress?: string
  } & TConfig
>
