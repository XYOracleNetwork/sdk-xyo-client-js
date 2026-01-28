import type { DivinerConfig } from '@xyo-network/diviner-model'
import type { Schema } from '@xyo-network/payload-model'
import { asSchema } from '@xyo-network/payload-model'

import type { JsonPathTransformExpression } from './jsonpath/index.ts'
import { JsonPathDivinerSchema } from './Schema.ts'

/**
 * The config schema for the JSON Path diviner
 */
export const JsonPathDivinerConfigSchema = asSchema(`${JsonPathDivinerSchema}.config`, true)

/**
 * The config schema type for the JSON Path diviner
 */
export type JsonPathDivinerConfigSchema = typeof JsonPathDivinerConfigSchema

/**
 * The configuration for the JSON Path diviner
 */
export type JsonPathDivinerConfig = DivinerConfig<
  {
    /**
     * The schema to use for the destination payloads
     */
    destinationSchema?: Schema
    /**
     * The JSON Path transform expressions to apply to the payloads
     */
    transforms?: JsonPathTransformExpression[]
  } & { schema: JsonPathDivinerConfigSchema }
>
