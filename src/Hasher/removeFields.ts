// eslint-disable-next-line no-restricted-imports
import { ValueKeyIteratee } from 'lodash'
import assign from 'lodash/assign'
import isObject from 'lodash/isObject'
import mapValues from 'lodash/mapValues'
import omitBy from 'lodash/omitBy'
import pickBy from 'lodash/pickBy'

export const deepBy = <T>(obj: T, predicate: ValueKeyIteratee<T>, func: typeof omitBy | typeof pickBy) => {
  if (Array.isArray(obj)) {
    return obj
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onlyObjects = pickBy<T>(obj as any, isObject)
  const processedObjects = mapValues<T>(onlyObjects, (obj: T) => deepBy(obj, predicate, func))
  const addBackValues = assign(processedObjects, omitBy(obj, isObject))
  return omitBy(addBackValues, predicate) as T
}

export const deepOmitUnderscoreFields = <T>(obj: T) => {
  return deepBy(obj, (_, key) => key.startsWith('_'), omitBy)
}

export const deepPickUnderscoreFields = <T>(obj: T) => {
  return deepBy(obj, (_, key) => key.startsWith('_'), pickBy)
}
