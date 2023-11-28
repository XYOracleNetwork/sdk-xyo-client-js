import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { TemporalIndexingDivinerIndexCandidateToIndexDivinerConfig } from './Config'

export type TemporalIndexingDivinerIndexCandidateToIndexDivinerParams = DivinerParams<
  AnyConfigSchema<TemporalIndexingDivinerIndexCandidateToIndexDivinerConfig>
>
