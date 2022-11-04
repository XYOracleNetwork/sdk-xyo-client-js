// Inspired by https://stackoverflow.com/a/49079549/2803259

import every from 'lodash/every'
import isArray from 'lodash/isArray'
import isBoolean from 'lodash/isBoolean'
import isNull from 'lodash/isNull'
import isNumber from 'lodash/isNumber'
import isPlainObject from 'lodash/isPlainObject'
import isString from 'lodash/isString'
import isUndefined from 'lodash/isUndefined'
import overSome from 'lodash/overSome'

const JSONPrimitiveChecks = [isUndefined, isNull, isBoolean, isNumber, isString]
const JSONComplexChecks = [isPlainObject, isArray]

export const serializable = (field: unknown, depth?: number): boolean | null => {
  let depthExceeded = false
  const decrementDepth = () => (depth ? depth-- : undefined)

  const recursiveSerializable = (field: unknown) => {
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

export const serializableField = (field: unknown) => {
  return overSome([...JSONPrimitiveChecks, ...JSONComplexChecks])(field)
}
