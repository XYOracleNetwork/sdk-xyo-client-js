import { AbstractModuleConfig } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

export type XyoDivinerConfigSchema = 'network.xyo.diviner.config'
export const XyoDivinerConfigSchema: XyoDivinerConfigSchema = 'network.xyo.diviner.config'

export type DivinerConfig<TTarget extends XyoPayload = XyoPayload, TConfig extends XyoPayload = XyoPayload> = AbstractModuleConfig<
  {
    targetSchema?: TTarget['schema']
  } & TConfig
>

/** @deprecated use DivinerConfig instead */
export type XyoDivinerConfig<TTarget extends XyoPayload = XyoPayload, TConfig extends XyoPayload = XyoPayload> = DivinerConfig<TTarget, TConfig>
