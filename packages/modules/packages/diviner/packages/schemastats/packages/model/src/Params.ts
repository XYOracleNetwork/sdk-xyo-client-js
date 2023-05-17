import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { SchemaStatsDivinerConfig } from './Config'

export type SchemaStatsDivinerParams = DivinerParams<AnyConfigSchema<SchemaStatsDivinerConfig>>
