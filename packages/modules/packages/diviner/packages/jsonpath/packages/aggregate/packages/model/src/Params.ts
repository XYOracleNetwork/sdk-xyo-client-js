import type { DivinerParams } from '@xyo-network/diviner-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { JsonPathAggregateDivinerConfig } from './Config.ts'

/**
 * The params type the JSON Path diviner
 **/
export type JsonPathAggregateDivinerParams = DivinerParams<AnyConfigSchema<JsonPathAggregateDivinerConfig>>
