import { IndexingDivinerSchema } from '@xyo-network/diviner-indexing-model'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

export const TemporalIndexingDivinerSchema = `${IndexingDivinerSchema}.temporal` as const
export type TemporalIndexingDivinerSchema = typeof TemporalIndexingDivinerSchema

export const TemporalIndexingDivinerResultSchema = `${TemporalIndexingDivinerSchema}.result` as const
export type TemporalIndexingDivinerResultSchema = typeof TemporalIndexingDivinerResultSchema
export type TemporalIndexingDivinerResult = Payload<
  {
    sources: string[]
    timestamp: string
  },
  TemporalIndexingDivinerResultSchema
>
export const isTemporalIndexingDivinerResult = isPayloadOfSchemaType<TemporalIndexingDivinerResult>(TemporalIndexingDivinerResultSchema)

export const TemporalIndexingDivinerResultIndexSchema = `${TemporalIndexingDivinerResultSchema}.index` as const
export type TemporalIndexingDivinerResultIndexSchema = typeof TemporalIndexingDivinerResultIndexSchema
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
