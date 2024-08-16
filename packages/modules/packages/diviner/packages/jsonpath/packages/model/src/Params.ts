import type { DivinerParams } from '@xyo-network/diviner-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { JsonPathDivinerConfig } from './Config.ts'

/**
 * The params type the JSON Path diviner
 **/
export type JsonPathDivinerParams = DivinerParams<AnyConfigSchema<JsonPathDivinerConfig>>
