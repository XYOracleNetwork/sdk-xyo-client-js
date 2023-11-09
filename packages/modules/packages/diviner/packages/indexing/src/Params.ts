import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { IndexingDivinerConfig } from './Config'

export type IndexingDivinerParams = DivinerParams<AnyConfigSchema<IndexingDivinerConfig>>
