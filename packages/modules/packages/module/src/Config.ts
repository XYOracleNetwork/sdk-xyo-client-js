import { XyoPayload } from '@xyo-network/payload'

export type XyoModuleConfigSchema = 'network.xyo.module.config'
export const XyoModuleConfigSchema: XyoModuleConfigSchema = 'network.xyo.module.config'

export type XyoModuleConfig<TConfig extends XyoPayload = XyoPayload> = XyoPayload<TConfig, TConfig['schema']>
