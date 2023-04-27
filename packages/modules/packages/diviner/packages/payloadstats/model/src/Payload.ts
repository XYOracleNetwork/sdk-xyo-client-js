import { Payload } from '@xyo-network/payload-model'

import { PayloadStatsDivinerSchema } from './Schema'

export type PayloadStatsPayload = Payload<{ count: number; schema: PayloadStatsDivinerSchema }>
export const isPayloadStatsPayload = (x?: Payload | null): x is PayloadStatsPayload => x?.schema === PayloadStatsDivinerSchema
