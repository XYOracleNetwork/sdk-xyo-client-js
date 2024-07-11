import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { IndexedDbPayloadDivinerConfig } from './Config.js'

export type IndexedDbPayloadDivinerParams = DivinerParams<AnyConfigSchema<IndexedDbPayloadDivinerConfig>>
