import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { JsonPathAggregateDivinerConfig } from './Config'

/**
 * The params type the JSON Path diviner
 **/
export type JsonPathAggregateDivinerParams = DivinerParams<AnyConfigSchema<JsonPathAggregateDivinerConfig>>
