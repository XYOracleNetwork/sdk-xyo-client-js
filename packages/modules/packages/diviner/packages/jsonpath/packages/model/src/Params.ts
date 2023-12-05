import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { JsonPathDivinerConfig } from './Config'

export type JsonPathDivinerParams = DivinerParams<AnyConfigSchema<JsonPathDivinerConfig>>
