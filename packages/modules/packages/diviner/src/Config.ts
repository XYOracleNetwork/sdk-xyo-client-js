import { XyoModuleConfig } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

export type XyoDivinerConfigSchema = 'network.xyo.diviner.config'
export const XyoDivinerConfigSchema: XyoDivinerConfigSchema = 'network.xyo.diviner.config'

export type XyoDivinerConfig<TTarget extends XyoPayload = XyoPayload, TConfig extends XyoPayload = XyoPayload> = XyoModuleConfig<
  TConfig & {
    targetSchema?: TTarget['schema']
  }
>
