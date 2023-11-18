import { IndexingDivinerSchema } from '@xyo-network/diviner-indexing-model'

export const TemporalIndexingDivinerSchema = `${IndexingDivinerSchema}.temporal` as const
export type TemporalIndexingDivinerSchema = typeof TemporalIndexingDivinerSchema
