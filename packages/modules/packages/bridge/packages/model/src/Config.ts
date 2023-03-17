import { ModuleConfig } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'

export type XyoBridgeConfigSchema = 'network.xyo.bridge.config'
export const XyoBridgeConfigSchema: XyoBridgeConfigSchema = 'network.xyo.bridge.config'

export type BridgeConfig<TConfig extends Payload | undefined = undefined> = ModuleConfig<TConfig>
