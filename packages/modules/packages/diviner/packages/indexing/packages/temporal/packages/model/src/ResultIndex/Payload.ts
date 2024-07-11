import { Hash } from '@xylabs/hex'
import { isPayloadOfSchemaType, Payload, WithMeta } from '@xyo-network/payload-model'

import { TemporalIndexingDivinerResultIndexSchema } from './Schema.js'

export type TemporalIndexingDivinerResultIndex = Payload<
  {
    sources: Hash[]
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
