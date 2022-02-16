import shajs from 'sha.js'

import { removeEmptyFields } from './removeEmptyFields'
import { removeUnderscoreFields } from './removeUnderscoreFields'
import { sortFields } from './sortFields'

export class XyoHasher<T extends Record<string, unknown>> {
  public readonly obj: T
  constructor(obj: T) {
    this.obj = obj
  }

  get hashFields() {
    return removeEmptyFields(removeUnderscoreFields(this.obj))
  }

  public sortedStringify() {
    const sortedEntry = sortFields(this.hashFields)
    return JSON.stringify(sortedEntry)
  }

  public sortedHash() {
    return this.sortedHashData().toString('hex')
  }

  private sortedHashData() {
    const stringObject = this.sortedStringify()
    return shajs('sha256').update(stringObject).digest()
  }
}
