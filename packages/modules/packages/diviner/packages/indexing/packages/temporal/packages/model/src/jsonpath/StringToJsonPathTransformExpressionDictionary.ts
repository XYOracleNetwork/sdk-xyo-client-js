import { JsonPathTransformExpression } from './JsonPathTransformExpression'

/**
 * A dictionary of string keys to JsonPathTransformExpressions.
 */
export type StringToJsonPathTransformExpressionsDictionary<T extends { [key: string]: unknown } = { [key: string]: unknown }> = {
  [key in keyof T]: JsonPathTransformExpression[]
}
