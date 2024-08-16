import type { DivinerParams } from '@xyo-network/diviner-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { TemporalIndexingDivinerIndexCandidateToIndexDivinerConfig } from './Config.ts'

/**
 * Diviner Params for a Diviner which transforms Index Candidates to Indexes
 */
export type TemporalIndexingDivinerIndexCandidateToIndexDivinerParams = DivinerParams<
  AnyConfigSchema<TemporalIndexingDivinerIndexCandidateToIndexDivinerConfig>
>
