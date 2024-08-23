import type { JsonPathTransformExpression, PayloadTransformer } from '@xyo-network/diviner-jsonpath-model'
import type { Payload } from '@xyo-network/payload-model'
import jsonpath from 'jsonpath'

/**
 * Converts a JSON Path transform expression to a payload transformer
 * @param transformExpression The transform expression to convert
 * @returns The payload transformer for the JSON Path transform expression
 */
export const toPayloadTransformer = (transformExpression: JsonPathTransformExpression) => {
  const {
    defaultValue, destinationField, sourcePathExpression,
  } = transformExpression
  const transformer: PayloadTransformer = (x: Payload) => {
    const source = jsonpath.value(x, sourcePathExpression)
    // TODO: If the expression should return multiple values, use jsonpath.query
    // instead of jsonpath.value
    // const source =
    //   isScalarJsonPathExpression(transformExpression.sourcePathExpression) ?
    //     jsonpath.value(x, sourcePathExpression)
    //   : jsonpath.query(x, sourcePathExpression)
    const transformed: Record<string, unknown> = {}
    // Assign the source value to the destination field or the default value if the source is undefined
    const destinationValue = source === undefined ? defaultValue : source
    if (destinationValue !== undefined) transformed[destinationField] = destinationValue
    return transformed
  }
  return transformer
}
