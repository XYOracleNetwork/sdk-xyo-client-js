import { asSchema } from '@xyo-network/payload-model'
/**
 * The schema used for the JSONPath Diviner.
 */
export const JsonPathDivinerSchema = asSchema('network.xyo.diviner.jsonpath', true)

/**
 * The schema type used for the JSONPath Diviner.
 */
export type JsonPathDivinerSchema = typeof JsonPathDivinerSchema
