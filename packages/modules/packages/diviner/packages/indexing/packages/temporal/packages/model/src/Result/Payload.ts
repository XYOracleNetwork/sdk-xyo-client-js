import type { Hash } from '@xylabs/hex'
import type { Payload } from '@xyo-network/payload-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'

import { TemporalIndexingDivinerResultSchema } from './Schema.ts'

export type TemporalIndexingDivinerResult = Payload<
  {
    sources: Hash[]
    timestamp: string
  },
  TemporalIndexingDivinerResultSchema
>
export const isTemporalIndexingDivinerResult = isPayloadOfSchemaType<TemporalIndexingDivinerResult>(TemporalIndexingDivinerResultSchema)
