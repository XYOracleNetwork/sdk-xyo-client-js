import { asSchema } from '@xyo-network/payload-model'

import { TemporalIndexingDivinerSchema } from '../Schema.ts'

export const TemporalIndexingDivinerResultSchema = asSchema(`${TemporalIndexingDivinerSchema}.result`, true)
export type TemporalIndexingDivinerResultSchema = typeof TemporalIndexingDivinerResultSchema
