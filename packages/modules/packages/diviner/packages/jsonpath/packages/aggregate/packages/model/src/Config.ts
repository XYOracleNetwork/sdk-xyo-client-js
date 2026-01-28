import type { DivinerConfig } from '@xyo-network/diviner-model'
import type { Schema } from '@xyo-network/payload-model'
import { asSchema } from '@xyo-network/payload-model'

import type { SchemaToJsonPathTransformExpressionsDictionary } from './jsonpath/index.ts'
import { JsonPathAggregateDivinerSchema } from './Schema.ts'

/**
 * The config schema for the JSON Path diviner
 */
export const JsonPathAggregateDivinerConfigSchema = asSchema(`${JsonPathAggregateDivinerSchema}.config`, true)

/**
 * The config schema type for the JSON Path diviner
 */
export type JsonPathAggregateDivinerConfigSchema = typeof JsonPathAggregateDivinerConfigSchema

/**
 * The configuration for the JSON Path diviner
 */
export type JsonPathAggregateDivinerConfig = DivinerConfig<
  {
    /**
     * The schema to use for the destination payloads
     */
    destinationSchema?: Schema
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
