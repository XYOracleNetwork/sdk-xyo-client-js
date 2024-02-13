import { isPayloadOfSchemaType, Payload, WithMeta } from '@xyo-network/payload-model'

import { TemporalIndexingDivinerResultIndexSchema } from './Schema'

export type TemporalIndexingDivinerResultIndex = Payload<
  {
    sources: string[]
    timestamp: number
  },
  TemporalIndexingDivinerResultIndexSchema
>

export const isTemporalIndexingDivinerResultIndex = isPayloadOfSchemaType<TemporalIndexingDivinerResultIndex>(
  TemporalIndexingDivinerResultIndexSchema,
)

export const isTemporalIndexingDivinerResultIndexWithMeta = isPayloadOfSchemaType<WithMeta<TemporalIndexingDivinerResultIndex>>(
  TemporalIndexingDivinerResultIndexSchema,
)
