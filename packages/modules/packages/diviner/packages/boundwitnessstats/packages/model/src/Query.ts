import {
  asSchema, type Payload, type Query,
} from '@xyo-network/payload-model'

import { BoundWitnessStatsDivinerSchema } from './Schema.ts'

export const BoundWitnessStatsQuerySchema = asSchema(`${BoundWitnessStatsDivinerSchema}.query`, true)
export type BoundWitnessStatsQuerySchema = typeof BoundWitnessStatsQuerySchema

export type BoundWitnessStatsQueryPayload = Query<{ schema: BoundWitnessStatsQuerySchema }>
export const isBoundWitnessStatsQueryPayload = (x?: Payload | null): x is BoundWitnessStatsQueryPayload => x?.schema === BoundWitnessStatsQuerySchema
