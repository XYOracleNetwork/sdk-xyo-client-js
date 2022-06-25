// eslint-disable-next-line no-restricted-imports
import { ValueKeyIteratee } from 'lodash'
import isObject from 'lodash/isObject'
import mapValues from 'lodash/mapValues'
import merge from 'lodash/merge'
import omitBy from 'lodash/omitBy'
import pickBy from 'lodash/pickBy'

export const deepBy = <T extends object>(obj: T, predicate: ValueKeyIteratee<T>, func: typeof omitBy | typeof pickBy): T => {
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

  return merge(pickedNonObjects, processedObjects) as T
}

export const deepOmitUnderscoreFields = <T extends object>(obj: T) => {
  return deepBy(obj, (_, key) => key.startsWith('_'), omitBy)
}

export const deepPickUnderscoreFields = <T extends object>(obj: T) => {
  return deepBy(obj, (_, key) => key.startsWith('_'), pickBy)
}
