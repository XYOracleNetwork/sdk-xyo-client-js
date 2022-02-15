import assign from 'lodash/assign'
import isNil from 'lodash/isNil'
import isObject from 'lodash/isObject'
import mapValues from 'lodash/mapValues'
import omitBy from 'lodash/omitBy'
import pickBy from 'lodash/pickBy'

import { sortedHash, sortedHashArray } from './sortedHash'
import { sortedStringify } from './sortedStringify'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hasLeadingUnderscore = (_: any, key: any) => key.startsWith('_')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const removeUnderscoreFields = <T>(obj: T) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onlyObjects = pickBy<T>(obj as any, isObject)
  const processedObjects = mapValues<T>(onlyObjects, removeUnderscoreFields)
  const addBackValues = assign(processedObjects, omitBy(obj, isObject))
  const ommited = omitBy(addBackValues, hasLeadingUnderscore)
  return ommited
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const removeEmptyFields = <T>(obj: T) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onlyObjects = pickBy<T>(obj as any, isObject)
  const processedObjects = mapValues<T>(onlyObjects, removeUnderscoreFields)
  const addBackValues = assign(processedObjects, omitBy(obj, isObject))
  const ommited = omitBy(addBackValues, isNil)
  return ommited
}

export class XyoHasher<T extends Record<string, unknown>> {
  public readonly obj: T
  constructor(obj: T) {
    this.obj = obj
  }

  get hashFields() {
    return removeEmptyFields(removeUnderscoreFields(this.obj))
  }

  public sortedStringify() {
    return sortedStringify(this.hashFields)
  }

  public sortedHash() {
    return sortedHash(this.hashFields)
  }

  public sortedHashArray() {
    return sortedHashArray(this.hashFields)
  }
}
