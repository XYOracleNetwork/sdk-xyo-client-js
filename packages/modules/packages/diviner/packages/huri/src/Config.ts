import { DivinerConfig } from '@xyo-network/diviner-model'
import { HuriOptions } from '@xyo-network/huri'
import { Payload } from '@xyo-network/payload-model'

export type HuriPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.huri.config'
export const HuriPayloadDivinerConfigSchema: HuriPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.huri.config'

export type HuriPayloadDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  T & {
    options?: HuriOptions
    schema: HuriPayloadDivinerConfigSchema
  }
>
