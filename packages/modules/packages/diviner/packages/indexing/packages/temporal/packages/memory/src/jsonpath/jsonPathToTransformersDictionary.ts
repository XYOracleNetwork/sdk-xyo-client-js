import {
  PayloadTransformer,
  StringToJsonPathTransformExpressionsDictionary,
  StringToPayloadTransformersDictionary,
} from '@xyo-network/diviner-temporal-indexing-model'
import { Payload } from '@xyo-network/payload-model'
import jsonpath from 'jsonpath'

/**
 * Materializes the JSON-path expressions into memoized functions by converting a
 * dictionary of schema to JSON Path transform expressions to a dictionary
 * of schema to payload transformers
 * @param schemaTransforms The schema transforms to convert
 * @returns A dictionary of schema to payload transformers
 */
export const jsonPathToTransformersDictionary = (
  schemaTransforms: StringToJsonPathTransformExpressionsDictionary,
): StringToPayloadTransformersDictionary => {
  return Object.fromEntries(
    Object.entries(schemaTransforms).map(([schema, jsonPathTransformerExpressions]) => {
      const transformers = jsonPathTransformerExpressions.map((transformExpression) => {
        const { sourcePathExpression, destinationField } = transformExpression
        const transformer: PayloadTransformer = (x: Payload) => {
          // eslint-disable-next-line import/no-named-as-default-member
          const source = jsonpath.value(x, sourcePathExpression)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const transformed = {} as { [key: string]: any }
          transformed[destinationField] = source
          return transformed
        }
        return transformer
      })
      return [schema, transformers]
    }),
  )
}
