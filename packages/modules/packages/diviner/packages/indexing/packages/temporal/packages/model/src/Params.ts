import { IndexingDivinerParams } from '@xyo-network/diviner-indexing-model'
import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { TemporalIndexingDivinerConfig } from './Config'

// TODO: Extend indexing diviner params and just remove fields that are not needed?
export type TemporalIndexingDivinerParams = IndexingDivinerParams & DivinerParams<AnyConfigSchema<TemporalIndexingDivinerConfig>>
