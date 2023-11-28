/**
 * Describes the JSON-path transformation to retrieve a field on a source object
 * and the target field to store the value to on a destination object
 */
export interface JsonPathTransformExpression {
  /**
   * The target field to store the source field into on the destination object
   */
  destinationField: string
  /**
   * The JSON path expressions for the source field on the source object
   */
  sourcePathExpression: string
}
