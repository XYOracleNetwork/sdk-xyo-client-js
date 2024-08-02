import { TemporalIndexingDivinerSchema } from '../Schema.ts'

export const TemporalIndexingDivinerResultSchema = `${TemporalIndexingDivinerSchema}.result` as const
export type TemporalIndexingDivinerResultSchema = typeof TemporalIndexingDivinerResultSchema
