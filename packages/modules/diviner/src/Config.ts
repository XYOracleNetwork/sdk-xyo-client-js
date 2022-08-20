import { XyoModuleConfig } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

export type XyoDivinerConfigSchema = 'network.xyo.diviner.config'
export const XyoDivinerConfigSchema: XyoDivinerConfigSchema = 'network.xyo.diviner.config'

export type XyoDivinerConfig<TConfig extends XyoPayload = XyoPayload<{ schema: XyoDivinerConfigSchema | string }>> = XyoModuleConfig<TConfig>
