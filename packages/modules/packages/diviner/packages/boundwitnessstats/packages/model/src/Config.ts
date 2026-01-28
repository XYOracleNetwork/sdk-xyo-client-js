import type { DivinerConfig } from '@xyo-network/diviner-model'
import { asSchema, type Payload } from '@xyo-network/payload-model'

import { BoundWitnessStatsDivinerSchema } from './Schema.ts'

export const BoundWitnessStatsDivinerConfigSchema = asSchema(`${BoundWitnessStatsDivinerSchema}.config`, true)
export type BoundWitnessStatsDivinerConfigSchema = typeof BoundWitnessStatsDivinerConfigSchema

export type BoundWitnessStatsDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  T & {
    schema: BoundWitnessStatsDivinerConfigSchema
  }
>
