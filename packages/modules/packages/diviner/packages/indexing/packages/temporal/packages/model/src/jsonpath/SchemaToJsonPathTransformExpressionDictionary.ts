import { JsonPathTransformExpression } from './JsonPathTransformExpression'

/**
 * A dictionary of schema to JsonPathTransformExpressions.
 */
export type SchemaToJsonPathTransformExpressionsDictionary<T extends { [schema: string]: unknown } = { [schema: string]: unknown }> = {
  [key in keyof T]: JsonPathTransformExpression[]
}
