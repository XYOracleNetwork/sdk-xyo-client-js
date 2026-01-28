import type { Schema } from '@xyo-network/payload-model'

import type { JsonPathTransformExpression } from './JsonPathTransformExpression.ts'

/**
 * A dictionary of schema to JSON Path transform expressions.
 */
export type SchemaToJsonPathTransformExpressionsDictionary<T extends { [schema: Schema]: unknown } = { [schema: Schema]: unknown }> = {
  [key in keyof T]: JsonPathTransformExpression[]
}
