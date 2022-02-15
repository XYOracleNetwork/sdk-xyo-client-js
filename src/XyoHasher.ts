import isNil from 'lodash/isNil'
import omitBy from 'lodash/omitBy'

import { sortedHash, sortedHashArray } from './sortedHash'
import { sortedStringify } from './sortedStringify'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const checkLeadingUnderscore = (_: any, key: any) => key.startsWith('_')

export const removeUnderscoreFields = <T>(obj: T) => {
  return omitBy(obj, checkLeadingUnderscore)
}

export const removeEmptyFields = <T>(obj: T) => {
  return omitBy(obj, isNil)
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
