import { AbstractModuleConfig } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

export type XyoBridgeConfigSchema = 'network.xyo.bridge.config'
export const XyoBridgeConfigSchema: XyoBridgeConfigSchema = 'network.xyo.bridge.config'

export type BridgeConfig<TConfig extends XyoPayload = XyoPayload> = AbstractModuleConfig<
  {
    nodeUri: string
    targetAddress?: string
  } & TConfig
>

/** @deprecated use BridgeConfig instead */
export type XyoBridgeConfig<TConfig extends XyoPayload = XyoPayload> = BridgeConfig<TConfig>
