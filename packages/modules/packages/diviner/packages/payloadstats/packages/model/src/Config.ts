import type { DivinerConfig } from '@xyo-network/diviner-model'
import { asSchema, type Payload } from '@xyo-network/payload-model'

import { PayloadStatsDivinerSchema } from './Schema.ts'

export const PayloadStatsDivinerConfigSchema = asSchema(`${PayloadStatsDivinerSchema}.config`, true)
export type PayloadStatsDivinerConfigSchema = typeof PayloadStatsDivinerConfigSchema

export type PayloadStatsDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  T & {
    schema: PayloadStatsDivinerConfigSchema
  }
>
