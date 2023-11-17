import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { TemporalIndexingDivinerConfig } from './Config'

export type TemporalIndexingDivinerParams = DivinerParams<AnyConfigSchema<TemporalIndexingDivinerConfig>>
