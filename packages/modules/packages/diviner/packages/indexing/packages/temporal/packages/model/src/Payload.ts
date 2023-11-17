import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { TemporalIndexingDivinerResultIndexSchema, TemporalIndexingDivinerResultSchema } from './Schema'

export type TemporalIndexingDivinerResult = Payload<
  {
    sources: string[]
    timestamp: string
  },
  TemporalIndexingDivinerResultSchema
>
export const isTemporalIndexingDivinerResult = isPayloadOfSchemaType<TemporalIndexingDivinerResult>(TemporalIndexingDivinerResultSchema)

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
