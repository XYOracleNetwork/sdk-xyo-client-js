import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { SchemaListDivinerConfig } from './Config.js'

export type SchemaListDivinerParams = DivinerParams<AnyConfigSchema<SchemaListDivinerConfig>>
