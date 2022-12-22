import { DivinerConfig } from '@xyo-network/diviner-model'
import { HuriOptions } from '@xyo-network/huri'
import { XyoPayload } from '@xyo-network/payload-model'

export type XyoHuriPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.huri.config'
export const XyoHuriPayloadDivinerConfigSchema: XyoHuriPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.huri.config'

export type XyoHuriPayloadDivinerConfig<T extends XyoPayload = XyoPayload> = DivinerConfig<
  XyoPayload,
  T & {
    options?: HuriOptions
    schema: XyoHuriPayloadDivinerConfigSchema
  }
>
