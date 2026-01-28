import { asSchema } from '@xyo-network/payload-model'

/**
 * The schema used for the JSONPath Diviner.
 */
export const JsonPathAggregateDivinerSchema = asSchema('network.xyo.diviner.jsonpath.aggregate', true)

/**
 * The schema type used for the JSONPath Diviner.
 */
export type JsonPathAggregateDivinerSchema = typeof JsonPathAggregateDivinerSchema
