import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { TemporalIndexingDivinerResultSchema } from './Schema'

export type TemporalIndexingDivinerResult = Payload<
  {
    sources: string[]
    timestamp: string
  },
  TemporalIndexingDivinerResultSchema
>
export const isTemporalIndexingDivinerResult = isPayloadOfSchemaType<TemporalIndexingDivinerResult>(TemporalIndexingDivinerResultSchema)
