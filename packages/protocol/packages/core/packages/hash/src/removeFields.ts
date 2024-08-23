import { assertEx } from '@xylabs/assert'
import {
  mapValues, merge, omitBy, pickBy,
} from '@xylabs/lodash'
import type { EmptyObject } from '@xylabs/object'
import { isObject } from '@xylabs/object'
type ValueKeyIteratee<T> = (value: T, key: string) => unknown

export const deepBy = <T extends EmptyObject>(obj: T, predicate: ValueKeyIteratee<T>, func: typeof omitBy | typeof pickBy): T => {
  if (Array.isArray(obj)) {
    return obj
  }

  // pick the child objects
  const onlyObjects = pickBy<T>(obj, isObject)

  // pick the child non-objects
  const nonObjects = pickBy<T>(obj, value => !isObject(value))

  const pickedObjects = omitBy(onlyObjects, predicate)
  const pickedNonObjects = omitBy(nonObjects, predicate)

  const processedObjects = mapValues(pickedObjects, (obj: T) => deepBy(obj, predicate, func))

  return merge({}, pickedNonObjects, processedObjects) as T
}

export const deepOmitPrefixedFields = <T extends EmptyObject>(obj: T, prefix: string): T => {
  return deepBy(
    obj,
    (_, key) => {
      assertEx(typeof key === 'string', () => `Invalid key type [${key}, ${typeof key}]`)
      return key.startsWith(prefix)
    },
    omitBy,
  )
}

export const deepPickUnderscoreFields = <T extends EmptyObject>(obj: T): T => {
  return deepBy(
    obj,
    (_, key) => {
      assertEx(typeof key === 'string', () => `Invalid key type [${key}, ${typeof key}]`)
      return key.startsWith('_')
    },
    pickBy,
  )
}
