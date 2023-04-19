import { Payload } from '@xyo-network/payload-model'

import { PayloadStatsDivinerConfig } from '../PayloadStats'
import { BoundWitnessStatsDivinerSchema } from './Schema'

export type BoundWitnessStatsDivinerConfigSchema = `${BoundWitnessStatsDivinerSchema}.config`
export const BoundWitnessStatsDivinerConfigSchema: BoundWitnessStatsDivinerConfigSchema = `${BoundWitnessStatsDivinerSchema}.config`

export type BoundWitnessStatsDivinerConfig<
  S extends string = BoundWitnessStatsDivinerConfigSchema,
  T extends Payload = Payload,
> = PayloadStatsDivinerConfig<
  S,
  T & {
    schema: S
  }
>
