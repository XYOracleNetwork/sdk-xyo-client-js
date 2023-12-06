import { JsonPathTransformExpression, PayloadTransformer } from '@xyo-network/diviner-jsonpath-aggregate-model'
import { Payload } from '@xyo-network/payload-model'
import jsonpath from 'jsonpath'

/**
 * Converts a JSON Path transform expression to a payload transformer
 * @param transformExpression The transform expression to convert
 * @returns The payload transformer for the JSON Path transform expression
 */
export const toPayloadTransformer = (transformExpression: JsonPathTransformExpression) => {
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
}
