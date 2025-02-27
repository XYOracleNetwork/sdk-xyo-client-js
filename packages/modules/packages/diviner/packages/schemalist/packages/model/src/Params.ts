import type { DivinerParams } from '@xyo-network/diviner-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { SchemaListDivinerConfig } from './Config.ts'

export type SchemaListDivinerParams = DivinerParams<AnyConfigSchema<SchemaListDivinerConfig>>
