import type { DivinerParams } from '@xyo-network/diviner-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { TemporalIndexingDivinerConfig } from './Config.ts'

// TODO: Extend indexing diviner params and just remove fields that are not needed?
export type TemporalIndexingDivinerParams = DivinerParams<AnyConfigSchema<TemporalIndexingDivinerConfig>>
