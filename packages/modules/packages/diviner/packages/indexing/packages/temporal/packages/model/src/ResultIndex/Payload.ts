import { isPayloadOfSchemaType, PayloadWithSources } from '@xyo-network/payload-model'

import { TemporalIndexingDivinerResultIndexSchema } from './Schema.ts'

export type TemporalIndexingDivinerResultIndex = PayloadWithSources<
  {
    timestamp: number
  },
  TemporalIndexingDivinerResultIndexSchema
>

export const isTemporalIndexingDivinerResultIndex = isPayloadOfSchemaType<TemporalIndexingDivinerResultIndex>(
  TemporalIndexingDivinerResultIndexSchema,
)
