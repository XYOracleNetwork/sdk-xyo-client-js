import type { DivinerParams } from '@xyo-network/diviner-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { TemporalIndexingDivinerStateToIndexCandidateDivinerConfig } from './Config.ts'

export type TemporalIndexingDivinerStateToIndexCandidateDivinerParams = DivinerParams<
  AnyConfigSchema<TemporalIndexingDivinerStateToIndexCandidateDivinerConfig>
>
