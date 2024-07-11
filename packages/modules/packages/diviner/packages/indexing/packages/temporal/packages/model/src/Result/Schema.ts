import { TemporalIndexingDivinerSchema } from '../Schema.js'

export const TemporalIndexingDivinerResultSchema = `${TemporalIndexingDivinerSchema}.result` as const
export type TemporalIndexingDivinerResultSchema = typeof TemporalIndexingDivinerResultSchema
