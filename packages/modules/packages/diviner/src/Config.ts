import { AbstractModuleConfig } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'

export type XyoDivinerConfigSchema = 'network.xyo.diviner.config'
export const XyoDivinerConfigSchema: XyoDivinerConfigSchema = 'network.xyo.diviner.config'

export type DivinerConfig<TTarget extends XyoPayload = XyoPayload, TConfig extends XyoPayload = XyoPayload> = AbstractModuleConfig<
  {
    targetSchema?: TTarget['schema']
  } & TConfig
>
