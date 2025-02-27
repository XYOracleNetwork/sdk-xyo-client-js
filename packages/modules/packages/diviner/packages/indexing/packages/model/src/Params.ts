import type { DivinerParams } from '@xyo-network/diviner-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { IndexingDivinerConfig } from './Config.ts'

export type IndexingDivinerParams = DivinerParams<AnyConfigSchema<IndexingDivinerConfig>>
