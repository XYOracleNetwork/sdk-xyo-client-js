import { DivinerConfig } from '@xyo-network/diviner-model'
import { HuriOptions } from '@xyo-network/huri'
import { Payload } from '@xyo-network/payload-model'

export const HuriPayloadDivinerConfigSchema = 'network.xyo.diviner.payload.huri.config' as const
export type HuriPayloadDivinerConfigSchema = typeof HuriPayloadDivinerConfigSchema

export type HuriPayloadDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  T & {
    options?: HuriOptions
    schema: HuriPayloadDivinerConfigSchema
  }
>
