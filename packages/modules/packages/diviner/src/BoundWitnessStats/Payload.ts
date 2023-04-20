import { Payload } from '@xyo-network/payload-model'

import { StatsDivinerPayload } from '../Stats'
import { BoundWitnessStatsDivinerSchema } from './Schema'

export type BoundWitnessStatsDivinerPayload = StatsDivinerPayload<{ schema: BoundWitnessStatsDivinerSchema }>
export const isBoundWitnessStatsDivinerPayload = (x?: Payload | null): x is BoundWitnessStatsDivinerPayload =>
  x?.schema === BoundWitnessStatsDivinerSchema
