import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { TemporalIndexingDivinerIndexCandidateToIndexDivinerConfig } from './Config'

/**
 * Diviner Params for a Diviner which transforms Index Candidates to Indexes
 */
export type TemporalIndexingDivinerIndexCandidateToIndexDivinerParams = DivinerParams<
  AnyConfigSchema<TemporalIndexingDivinerIndexCandidateToIndexDivinerConfig>
>
