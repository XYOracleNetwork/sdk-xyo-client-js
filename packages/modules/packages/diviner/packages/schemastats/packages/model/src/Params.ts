import type { DivinerParams } from '@xyo-network/diviner-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { SchemaStatsDivinerConfig } from './Config.ts'

export type SchemaStatsDivinerParams = DivinerParams<AnyConfigSchema<SchemaStatsDivinerConfig>>
