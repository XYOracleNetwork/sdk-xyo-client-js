import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { TemporalIndexingDivinerStateToIndexCandidateDivinerConfig } from './Config.js'

export type TemporalIndexingDivinerStateToIndexCandidateDivinerParams = DivinerParams<
  AnyConfigSchema<TemporalIndexingDivinerStateToIndexCandidateDivinerConfig>
>
