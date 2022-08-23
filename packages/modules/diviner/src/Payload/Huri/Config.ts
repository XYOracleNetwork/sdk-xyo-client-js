import { HuriOptions, XyoPayload } from '@xyo-network/payload'

import { XyoDivinerConfig } from '../../Config'

export type XyoHuriPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.huri.config'
export const XyoHuriPayloadDivinerConfigSchema: XyoHuriPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.huri.config'

export type XyoHuriPayloadDivinerConfig<TTargetPayload extends XyoPayload = XyoPayload, T extends XyoPayload = XyoPayload> = XyoDivinerConfig<
  TTargetPayload,
  T & {
    schema: XyoHuriPayloadDivinerConfigSchema
    options?: HuriOptions
  }
>
