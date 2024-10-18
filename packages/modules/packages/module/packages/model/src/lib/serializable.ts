export const isSerializable = (value: unknown, maxDepth = 10): boolean => {
  if (maxDepth <= 0) {
    return false
  }
  if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    return true
  }

  if (Array.isArray(value)) {
    return value.every(item => isSerializable(item, maxDepth - 1))
  }

  if (typeof value === 'object') {
    if (value instanceof Date || value instanceof RegExp) {
      return true
    }

    // Check for non-serializable objects like Set and Map
    if (value instanceof Set || value instanceof Map) {
      return false
    }

    if (value !== null && value !== undefined) {
      return Object.values(value).every(item => isSerializable(item, maxDepth - 1))
    }
  }

  // Exclude functions, symbols, undefined, and BigInt explicitly
  return false
}
