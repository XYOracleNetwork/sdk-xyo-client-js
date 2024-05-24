// Inspired by https://stackoverflow.com/a/49079549/2803259

// Utility functions to replace Lodash
const isUndefined = (value: unknown): boolean => value === undefined
const isNull = (value: unknown): boolean => value === null
const isBoolean = (value: unknown): boolean => typeof value === 'boolean'
const isNumber = (value: unknown): boolean => typeof value === 'number' && !Number.isNaN(value)
const isString = (value: unknown): boolean => typeof value === 'string'
const isPlainObject = (value: unknown): boolean => {
  return Object.prototype.toString.call(value) === '[object Object]'
}
const isArray = (value: unknown): boolean => Array.isArray(value)

// Equivalent to Lodash's overSome
const overSome =
  (checks: Array<(value: unknown) => boolean>) =>
  (value: unknown): boolean => {
    return checks.some((check) => check(value))
  }

// Equivalent to Lodash's every
const every = (obj: object, predicate: (value: unknown) => boolean): boolean => {
  return Object.values(obj).every(predicate)
}

const JSONPrimitiveChecks = [isUndefined, isNull, isBoolean, isNumber, isString]
const JSONComplexChecks = [isPlainObject, isArray]

export const serializable = (field: unknown, depth?: number): boolean | null => {
  let depthExceeded = false
  const decrementDepth = () => (depth ? depth-- : undefined)

  const recursiveSerializable = (field: unknown): boolean => {
    if (depth !== undefined && depth < 1) {
      depthExceeded = true
      return false
    }

    // decrement during every recursion
    decrementDepth()

    const nestedSerializable = (field: unknown): boolean => overSome(JSONComplexChecks)(field) && every(field as object, recursiveSerializable)

    return overSome([...JSONPrimitiveChecks, nestedSerializable])(field)
  }

  const valid = recursiveSerializable(field)

  return depthExceeded ? null : valid
}

export const serializableField = (field: unknown): boolean => {
  return overSome([...JSONPrimitiveChecks, ...JSONComplexChecks])(field)
}
