import { Query } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { PayloadStatsDivinerSchema } from './Schema'

export type PayloadStatsQuerySchema = `${PayloadStatsDivinerSchema}.query`
export const PayloadStatsQuerySchema: PayloadStatsQuerySchema = `${PayloadStatsDivinerSchema}.query`

export type PayloadStatsQueryPayload = Query<{ schema: PayloadStatsQuerySchema }>
export const isPayloadStatsQueryPayload = (x?: Payload | null): x is PayloadStatsQueryPayload => x?.schema === PayloadStatsQuerySchema
