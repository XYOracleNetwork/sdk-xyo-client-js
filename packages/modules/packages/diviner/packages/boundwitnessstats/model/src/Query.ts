import { Query } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { BoundWitnessStatsDivinerSchema } from './Schema'

export type BoundWitnessStatsQuerySchema = `${BoundWitnessStatsDivinerSchema}.query`
export const BoundWitnessStatsQuerySchema: BoundWitnessStatsQuerySchema = `${BoundWitnessStatsDivinerSchema}.query`

export type BoundWitnessStatsQueryPayload = Query<{ schema: BoundWitnessStatsQuerySchema }>
export const isBoundWitnessStatsQueryPayload = (x?: Payload | null): x is BoundWitnessStatsQueryPayload => x?.schema === BoundWitnessStatsQuerySchema
