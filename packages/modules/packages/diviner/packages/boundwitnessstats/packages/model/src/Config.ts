import type { DivinerConfig } from '@xyo-network/diviner-model'
import type { Payload } from '@xyo-network/payload-model'

import { BoundWitnessStatsDivinerSchema } from './Schema.ts'

export type BoundWitnessStatsDivinerConfigSchema = `${BoundWitnessStatsDivinerSchema}.config`
export const BoundWitnessStatsDivinerConfigSchema: BoundWitnessStatsDivinerConfigSchema = `${BoundWitnessStatsDivinerSchema}.config`

export type BoundWitnessStatsDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  T & {
    schema: BoundWitnessStatsDivinerConfigSchema
  }
>
