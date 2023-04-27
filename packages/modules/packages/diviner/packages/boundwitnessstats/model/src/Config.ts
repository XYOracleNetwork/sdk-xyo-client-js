import { DivinerConfig } from '@xyo-network/diviner-model'
import { Payload } from '@xyo-network/payload-model'

import { BoundWitnessStatsDivinerSchema } from './Schema'

export type BoundWitnessStatsDivinerConfigSchema = `${BoundWitnessStatsDivinerSchema}.config`
export const BoundWitnessStatsDivinerConfigSchema: BoundWitnessStatsDivinerConfigSchema = `${BoundWitnessStatsDivinerSchema}.config`

export type BoundWitnessStatsDivinerConfig<S extends string = string, T extends Payload = Payload> = DivinerConfig<
  T & {
    schema: S
  }
>
