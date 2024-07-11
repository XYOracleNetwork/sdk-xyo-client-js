import { JsonPathTransformExpression } from './JsonPathTransformExpression.js'

/**
 * A dictionary of schema to JSON Path transform expressions.
 */
export type SchemaToJsonPathTransformExpressionsDictionary<T extends { [schema: string]: unknown } = { [schema: string]: unknown }> = {
  [key in keyof T]: JsonPathTransformExpression[]
}
