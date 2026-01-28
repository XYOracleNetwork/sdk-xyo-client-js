import { IndexingDivinerSchema } from '@xyo-network/diviner-indexing-model'
import { asSchema } from '@xyo-network/payload-model'

export const TemporalIndexingDivinerSchema = asSchema(`${IndexingDivinerSchema}.temporal`, true)
export type TemporalIndexingDivinerSchema = typeof TemporalIndexingDivinerSchema
