/**
 * Determines if a JSON path expression is a scalar expression (targeting
 * a single property in the JSON object) or a multiple value expression
 * @param jsonPath The JSON path expression to check
 * @returns
 */
export const isScalarJsonPathExpression = (jsonPath: string) => {
  const multipleValueIndicators = ['*', '..', ',', ':']
  for (const indicator of multipleValueIndicators) {
    if (jsonPath.includes(indicator)) {
      return false
    }
  }
  return true
}
