import type { DivinerParams } from '@xyo-network/diviner-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { IndexedDbBoundWitnessDivinerConfig } from './Config.ts'

export type IndexedDbBoundWitnessDivinerParams = DivinerParams<AnyConfigSchema<IndexedDbBoundWitnessDivinerConfig>>
