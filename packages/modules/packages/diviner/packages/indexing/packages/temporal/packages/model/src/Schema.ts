import { IndexingDivinerSchema } from '@xyo-network/diviner-indexing-model'

export const TemporalIndexingDivinerSchema = `${IndexingDivinerSchema}.temporal` as const
export type TemporalIndexingDivinerSchema = typeof TemporalIndexingDivinerSchema

export const TemporalIndexingDivinerResultSchema = `${TemporalIndexingDivinerSchema}.result` as const
export type TemporalIndexingDivinerResultSchema = typeof TemporalIndexingDivinerResultSchema

export const TemporalIndexingDivinerResultIndexSchema = `${TemporalIndexingDivinerResultSchema}.index` as const
export type TemporalIndexingDivinerResultIndexSchema = typeof TemporalIndexingDivinerResultIndexSchema
