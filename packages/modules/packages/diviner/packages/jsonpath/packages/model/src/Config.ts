import { DivinerConfig } from '@xyo-network/diviner-model'

import { JsonPathTransformExpression } from './jsonpath'
import { JsonPathDivinerSchema } from './Schema'

/**
 * The config schema type for the JSON Path diviner
 */
export type JsonPathDivinerConfigSchema = `${JsonPathDivinerSchema}.config`
/**
 * The config schema for the JSON Path diviner
 */
export const JsonPathDivinerConfigSchema: JsonPathDivinerConfigSchema = `${JsonPathDivinerSchema}.config`

/**
 * The configuration for the JSON Path diviner
 */
export type JsonPathDivinerConfig = DivinerConfig<
  {
    /**
     * The JSON Path transform expressions to apply to the payloads
     */
    transforms: JsonPathTransformExpression[]
  } & { schema: JsonPathDivinerConfigSchema }
>
