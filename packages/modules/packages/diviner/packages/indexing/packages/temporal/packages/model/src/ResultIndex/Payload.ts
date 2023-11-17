import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { TemporalIndexingDivinerResultIndexSchema } from './Schema'

export type TemporalIndexingDivinerResultIndex = Payload<
  {
    sources: string[]
    timestamp: string
  },
  TemporalIndexingDivinerResultIndexSchema
>
export const isTemporalIndexingDivinerResultIndex = isPayloadOfSchemaType<TemporalIndexingDivinerResultIndex>(
  TemporalIndexingDivinerResultIndexSchema,
)
