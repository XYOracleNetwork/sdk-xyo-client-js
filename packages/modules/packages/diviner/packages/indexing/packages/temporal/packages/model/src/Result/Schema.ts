import { TemporalIndexingDivinerSchema } from '../Schema'

export const TemporalIndexingDivinerResultSchema = `${TemporalIndexingDivinerSchema}.result` as const
export type TemporalIndexingDivinerResultSchema = typeof TemporalIndexingDivinerResultSchema
