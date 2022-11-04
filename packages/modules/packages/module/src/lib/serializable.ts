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

export function serializable(obj: unknown, depth?: number): boolean | null {
  let depthExceeded = false
  const decrementDepth = () => (depth ? depth-- : undefined)

  const recursiveSerializable = (obj: unknown) => {
    if (depth !== undefined && depth < 1) {
      depthExceeded = true
      return false
    }

    // decrement during every recursion
    decrementDepth()

    const nestedSerializable = (obj: unknown): boolean => (isPlainObject(obj) || isArray(obj)) && every(obj as object, recursiveSerializable)

    return overSome([isUndefined, isNull, isBoolean, isNumber, isString, nestedSerializable])(obj)
  }

  const valid = recursiveSerializable(obj)

  return depthExceeded ? null : valid
}
