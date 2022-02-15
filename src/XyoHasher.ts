import isNil from 'lodash/isNil'
import isObject from 'lodash/isObject'
import omitBy from 'lodash/omitBy'
import pickBy from 'lodash/pickBy'

import { sortedHash, sortedHashArray } from './sortedHash'
import { sortedStringify } from './sortedStringify'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hasLeadingUnderscore = (_: any, key: any) => key.startsWith('_')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const removeUnderscoreFields = (obj: any) => {
  return pickBy(obj, isObject) // get only objects
    .mapValues(removeUnderscoreFields) // call only for values as objects
    .assign(omitBy(obj, isObject)) // save back result that is not object
    .omitBy(hasLeadingUnderscore) // remove underscor items
    .value() // get value
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const removeEmptyFields = (obj: any) => {
  return pickBy(obj, isObject) // get only objects
    .mapValues(removeEmptyFields) // call only for values as objects
    .assign(omitBy(obj, isObject)) // save back result that is not object
    .omitBy(isNil) // remove null and undefined from object
    .value() // get value
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
