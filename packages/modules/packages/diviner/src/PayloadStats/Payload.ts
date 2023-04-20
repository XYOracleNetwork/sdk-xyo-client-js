import { Payload } from '@xyo-network/payload-model'

import { StatsDivinerPayload } from '../Stats'
import { PayloadStatsDivinerSchema } from './Schema'

export type PayloadStatsPayload = StatsDivinerPayload<{ schema: PayloadStatsDivinerSchema }>
export const isPayloadStatsPayload = (x?: Payload | null): x is PayloadStatsPayload => x?.schema === PayloadStatsDivinerSchema
