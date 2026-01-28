import {
  asSchema, type Payload, type Query,
} from '@xyo-network/payload-model'

import { PayloadStatsDivinerSchema } from './Schema.ts'

export const PayloadStatsQuerySchema = asSchema(`${PayloadStatsDivinerSchema}.query`, true)
export type PayloadStatsQuerySchema = typeof PayloadStatsQuerySchema

export type PayloadStatsQueryPayload = Query<{ schema: PayloadStatsQuerySchema }>
export const isPayloadStatsQueryPayload = (x?: Payload | null): x is PayloadStatsQueryPayload => x?.schema === PayloadStatsQuerySchema
