import {
  PayloadTransformer,
  SchemaToJsonPathTransformExpressionsDictionary,
  SchemaToPayloadTransformersDictionary,
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
  schemaTransforms: SchemaToJsonPathTransformExpressionsDictionary,
): SchemaToPayloadTransformersDictionary => {
  return Object.fromEntries(
    Object.entries(schemaTransforms).map(([schema, jsonPathTransformerExpressions]) => {
      const transformers = jsonPathTransformerExpressions.map((transformExpression) => {
        const { defaultValue, destinationField, sourcePathExpression } = transformExpression
        const transformer: PayloadTransformer = (x: Payload) => {
          // eslint-disable-next-line import/no-named-as-default-member
          const source = jsonpath.value(x, sourcePathExpression)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const transformed = {} as { [key: string]: any }
          // Assign the source value to the destination field or the default value if the source is undefined
          const destinationValue = source === undefined ? defaultValue : source
          if (destinationValue !== undefined) transformed[destinationField] = destinationValue
          return transformed
        }
        return transformer
      })
      return [schema, transformers]
    }),
  )
}
