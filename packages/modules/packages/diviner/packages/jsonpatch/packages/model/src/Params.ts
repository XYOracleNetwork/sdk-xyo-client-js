import type { DivinerParams } from '@xyo-network/diviner-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { JsonPatchDivinerConfig } from './Config.ts'

export type JsonPatchDivinerParams = DivinerParams<AnyConfigSchema<JsonPatchDivinerConfig>>
