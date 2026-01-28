import { asSchema } from '@xyo-network/payload-model'

import { TemporalIndexingDivinerSchema } from '../Schema.ts'

export const TemporalIndexingDivinerIndexCandidateToIndexDivinerSchema
  = asSchema(`${TemporalIndexingDivinerSchema}.stage.indexCandidateToIndexDiviner`, true)

export type TemporalIndexingDivinerIndexCandidateToIndexDivinerSchema = typeof TemporalIndexingDivinerIndexCandidateToIndexDivinerSchema
