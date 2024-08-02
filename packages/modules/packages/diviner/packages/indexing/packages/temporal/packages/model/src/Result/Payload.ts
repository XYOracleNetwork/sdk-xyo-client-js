import { Hash } from '@xylabs/hex'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { TemporalIndexingDivinerResultSchema } from './Schema.ts'

export type TemporalIndexingDivinerResult = Payload<
  {
    sources: Hash[]
    timestamp: string
  },
  TemporalIndexingDivinerResultSchema
>
export const isTemporalIndexingDivinerResult = isPayloadOfSchemaType<TemporalIndexingDivinerResult>(TemporalIndexingDivinerResultSchema)
