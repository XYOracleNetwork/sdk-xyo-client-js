import type { Payload, Query } from '@xyo-network/payload-model'

import { PayloadStatsDivinerSchema } from './Schema.ts'

export type PayloadStatsQuerySchema = `${PayloadStatsDivinerSchema}.query`
export const PayloadStatsQuerySchema: PayloadStatsQuerySchema = `${PayloadStatsDivinerSchema}.query`

export type PayloadStatsQueryPayload = Query<{ schema: PayloadStatsQuerySchema }>
export const isPayloadStatsQueryPayload = (x?: Payload | null): x is PayloadStatsQueryPayload => x?.schema === PayloadStatsQuerySchema
