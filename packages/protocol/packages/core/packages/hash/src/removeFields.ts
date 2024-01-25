import { isObject, mapValues, merge, omitBy, pickBy } from '@xylabs/lodash'
import { EmptyObject } from '@xylabs/object'
// eslint-disable-next-line no-restricted-imports
import type { ValueKeyIteratee } from 'lodash'

export const deepBy = <T extends EmptyObject>(obj: T, predicate: ValueKeyIteratee<T>, func: typeof omitBy | typeof pickBy): T => {
  if (Array.isArray(obj)) {
    return obj
  }

  //pick the child objects
  const onlyObjects = pickBy<T>(obj, isObject)

  //pick the child non-objects
  const nonObjects = pickBy<T>(obj, (value) => !isObject(value))

  const pickedObjects = omitBy(onlyObjects, predicate)
  const pickedNonObjects = omitBy(nonObjects, predicate)

  const processedObjects = mapValues(pickedObjects, (obj: T) => deepBy(obj, predicate, func))

  return merge({}, pickedNonObjects, processedObjects) as T
}

export const deepOmitPrefixedFields = <T extends EmptyObject>(obj: T, prefix: string): T => {
  return deepBy(obj, (_, key) => key.startsWith(prefix), omitBy)
}

export const deepPickUnderscoreFields = <T extends EmptyObject>(obj: T): T => {
  return deepBy(obj, (_, key) => key.startsWith('_'), pickBy)
}
