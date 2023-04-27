import { Payload } from '@xyo-network/payload-model'

import { BoundWitnessStatsDivinerSchema } from './Schema'

export type BoundWitnessStatsPayload = Payload<{ count: number; schema: BoundWitnessStatsDivinerSchema }>
export const isBoundWitnessStatsPayload = (x?: Payload | null): x is BoundWitnessStatsPayload => x?.schema === BoundWitnessStatsDivinerSchema
