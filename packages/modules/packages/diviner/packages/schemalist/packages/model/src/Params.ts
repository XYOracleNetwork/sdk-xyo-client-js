import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { SchemaListDivinerConfig } from './Config'

export type SchemaListDivinerParams = DivinerParams<AnyConfigSchema<SchemaListDivinerConfig>>
