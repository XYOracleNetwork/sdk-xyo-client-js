import { Payload } from '@xyo-network/payload-model'

import { PayloadStatsDivinerSchema } from './Schema.js'

export type PayloadStatsPayload = Payload<{ count: number; schema: PayloadStatsDivinerSchema }>
export const isPayloadStatsPayload = (x?: Payload | null): x is PayloadStatsPayload => x?.schema === PayloadStatsDivinerSchema
