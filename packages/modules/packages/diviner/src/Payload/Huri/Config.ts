import { DivinerConfig } from '@xyo-network/diviner-model'
import { HuriOptions } from '@xyo-network/huri'
import { Payload } from '@xyo-network/payload-model'

export type XyoHuriPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.huri.config'
export const XyoHuriPayloadDivinerConfigSchema: XyoHuriPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.huri.config'

export type XyoHuriPayloadDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  T & {
    options?: HuriOptions
    schema: XyoHuriPayloadDivinerConfigSchema
  }
>
