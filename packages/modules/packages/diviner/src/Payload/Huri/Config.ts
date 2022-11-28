import { HuriOptions, XyoPayload } from '@xyo-network/payload'

import { DivinerConfig } from '../../Config'

export type XyoHuriPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.huri.config'
export const XyoHuriPayloadDivinerConfigSchema: XyoHuriPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.huri.config'

export type XyoHuriPayloadDivinerConfig<T extends XyoPayload = XyoPayload> = DivinerConfig<
  XyoPayload,
  T & {
    options?: HuriOptions
    schema: XyoHuriPayloadDivinerConfigSchema
  }
>
