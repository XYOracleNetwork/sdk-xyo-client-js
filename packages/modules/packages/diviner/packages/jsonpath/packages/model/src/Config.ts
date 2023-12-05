import { DivinerConfig } from '@xyo-network/diviner-model'

import { JsonPathDivinerSchema } from './Schema'

export type JsonPathDivinerConfigSchema = `${JsonPathDivinerSchema}.config`
export const JsonPathDivinerConfigSchema: JsonPathDivinerConfigSchema = `${JsonPathDivinerSchema}.config`

export type JsonPathDivinerConfig = DivinerConfig<{ schema: JsonPathDivinerConfigSchema }>
