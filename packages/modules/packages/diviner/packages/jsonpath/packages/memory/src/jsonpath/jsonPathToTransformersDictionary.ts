import { SchemaToJsonPathTransformExpressionsDictionary, SchemaToPayloadTransformersDictionary } from '@xyo-network/diviner-temporal-indexing-model'

import { toPayloadTransformer } from './toPayloadTransformer'

/**
 * Materializes the JSON-path expressions into memoized functions by converting a
 * dictionary of schema to JSON Path transform expressions to a dictionary
 * of schema to payload transformers
 * @param schemaTransforms The schema transforms to convert
 * @returns A dictionary of schema to payload transformers
 */
export const jsonPathToTransformersDictionary = (
  schemaTransforms: SchemaToJsonPathTransformExpressionsDictionary,
): SchemaToPayloadTransformersDictionary => {
  return Object.fromEntries(
    Object.entries(schemaTransforms).map(([schema, jsonPathTransformerExpressions]) => {
      const transformers = jsonPathTransformerExpressions.map(toPayloadTransformer)
      return [schema, transformers]
    }),
  )
}
