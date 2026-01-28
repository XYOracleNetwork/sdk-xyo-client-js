import type { DivinerConfig } from '@xyo-network/diviner-model'
import type { HuriOptions } from '@xyo-network/huri'
import { asSchema, type Payload } from '@xyo-network/payload-model'

export const HuriPayloadDivinerConfigSchema = asSchema('network.xyo.diviner.payload.huri.config', true)
export type HuriPayloadDivinerConfigSchema = typeof HuriPayloadDivinerConfigSchema

export type HuriPayloadDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  T & {
    options?: HuriOptions
    schema: HuriPayloadDivinerConfigSchema
  }
>
