import type { DivinerConfig } from '@xyo-network/diviner-model'

import type { JsonPathTransformExpression } from './jsonpath/index.ts'
import { JsonPathDivinerSchema } from './Schema.ts'

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
     * The schema to use for the destination payloads
     */
    destinationSchema?: string
    /**
     * The JSON Path transform expressions to apply to the payloads
     */
    transforms?: JsonPathTransformExpression[]
  } & { schema: JsonPathDivinerConfigSchema }
>
