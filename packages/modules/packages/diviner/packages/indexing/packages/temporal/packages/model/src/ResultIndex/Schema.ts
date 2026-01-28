import { asSchema } from '@xyo-network/payload-model'

import { TemporalIndexingDivinerResultSchema } from '../Result/index.ts'

export const TemporalIndexingDivinerResultIndexSchema = asSchema(`${TemporalIndexingDivinerResultSchema}.index`, true)
export type TemporalIndexingDivinerResultIndexSchema = typeof TemporalIndexingDivinerResultIndexSchema
