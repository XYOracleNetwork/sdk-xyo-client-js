import type { DivinerConfig } from '@xyo-network/diviner-model'
import { asSchema, type Payload } from '@xyo-network/payload-model'

import { BoundWitnessDivinerSchema } from './Schema.ts'

export const BoundWitnessDivinerConfigSchema = asSchema(`${BoundWitnessDivinerSchema}.config`, true)
export type BoundWitnessDivinerConfigSchema = typeof BoundWitnessDivinerConfigSchema

export type BoundWitnessDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  T & {
    schema: BoundWitnessDivinerConfigSchema
  }
>
