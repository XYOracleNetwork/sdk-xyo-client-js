import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { JsonPathDivinerConfig } from './Config'

/**
 * The params type the JSON Path diviner
 **/
export type JsonPathDivinerParams = DivinerParams<AnyConfigSchema<JsonPathDivinerConfig>>
