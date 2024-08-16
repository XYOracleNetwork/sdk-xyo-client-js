import type { Hash } from '@xylabs/hex'
import type { Payload, WithMeta } from '@xyo-network/payload-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'

import { TemporalIndexingDivinerResultIndexSchema } from './Schema.ts'

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
