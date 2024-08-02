import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { IndexedDbBoundWitnessDivinerConfig } from './Config.ts'

export type IndexedDbBoundWitnessDivinerParams = DivinerParams<AnyConfigSchema<IndexedDbBoundWitnessDivinerConfig>>
