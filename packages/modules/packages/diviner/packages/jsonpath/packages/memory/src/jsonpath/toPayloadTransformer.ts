import { JsonPathTransformExpression, PayloadTransformer } from '@xyo-network/diviner-jsonpath-model'
import { Payload } from '@xyo-network/payload-model'
import jsonpath from 'jsonpath'

/**
 * Determines if a JSON path expression is a scalar expression (targeting
 * a single property in the JSON object) or a multiple value expression
 * @param jsonPath The JSON path expression to check
 * @returns 
 */
const isScalarJsonPathExpression = (jsonPath: string)=> {
  const multipleValueIndicators = ['*', '..', ',', ':'];
  for (let indicator of multipleValueIndicators) {
      if (jsonPath.includes(indicator)) {
          return false;
      }
  }
  return true;
}

/**
 * Converts a JSON Path transform expression to a payload transformer
 * @param transformExpression The transform expression to convert
 * @returns The payload transformer for the JSON Path transform expression
 */
export const toPayloadTransformer = (transformExpression: JsonPathTransformExpression) => {
  const { defaultValue, destinationField, sourcePathExpression } = transformExpression
  const transformer: PayloadTransformer = (x: Payload) => {
    const source = jsonpath.query(x, sourcePathExpression)
    const transformed: Record<string, unknown> = {}
    // Assign the source value to the destination field or the default value if the source is undefined
    const destinationValue = source === undefined ? defaultValue : source
    if (destinationValue !== undefined) transformed[destinationField] = destinationValue
    return transformed
  }
  return transformer
}
