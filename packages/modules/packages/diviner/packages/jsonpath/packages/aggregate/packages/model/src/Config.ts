import { DivinerConfig } from '@xyo-network/diviner-model'

import { SchemaToJsonPathTransformExpressionsDictionary } from './jsonpath/index.js'
import { JsonPathAggregateDivinerSchema } from './Schema.js'

/**
 * The config schema type for the JSON Path diviner
 */
export type JsonPathAggregateDivinerConfigSchema = `${JsonPathAggregateDivinerSchema}.config`
/**
 * The config schema for the JSON Path diviner
 */
export const JsonPathAggregateDivinerConfigSchema: JsonPathAggregateDivinerConfigSchema = `${JsonPathAggregateDivinerSchema}.config`

/**
 * The configuration for the JSON Path diviner
 */
export type JsonPathAggregateDivinerConfig = DivinerConfig<
  {
    /**
     * The schema to use for the destination payloads
     */
    destinationSchema?: string
    /**
     * Exclude the source hashes from the destination payload.
     */
    excludeSources?: boolean
    /**
     * The JSON Path transform expressions to apply to the payloads
     */
    schemaTransforms?: SchemaToJsonPathTransformExpressionsDictionary
  } & { schema: JsonPathAggregateDivinerConfigSchema }
>
