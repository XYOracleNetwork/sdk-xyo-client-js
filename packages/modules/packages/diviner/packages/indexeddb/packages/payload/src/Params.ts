import type { DivinerParams } from '@xyo-network/diviner-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { IndexedDbPayloadDivinerConfig } from './Config.ts'

export type IndexedDbPayloadDivinerParams = DivinerParams<AnyConfigSchema<IndexedDbPayloadDivinerConfig>>
