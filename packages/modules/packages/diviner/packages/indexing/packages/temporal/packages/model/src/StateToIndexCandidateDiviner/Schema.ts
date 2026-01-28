import { asSchema } from '@xyo-network/payload-model'

import { TemporalIndexingDivinerSchema } from '../Schema.ts'

export const TemporalIndexingDivinerStateToIndexCandidateDivinerSchema
  = asSchema(`${TemporalIndexingDivinerSchema}.stage.stateToIndexCandidateDiviner`, true)

export type TemporalIndexingDivinerStateToIndexCandidateDivinerSchema = typeof TemporalIndexingDivinerStateToIndexCandidateDivinerSchema
