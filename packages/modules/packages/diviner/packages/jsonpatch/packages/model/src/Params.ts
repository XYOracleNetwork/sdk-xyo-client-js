import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { JsonPatchDivinerConfig } from './Config.ts'

export type JsonPatchDivinerParams = DivinerParams<AnyConfigSchema<JsonPatchDivinerConfig>>
