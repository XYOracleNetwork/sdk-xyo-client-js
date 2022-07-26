import shajs from 'sha.js'

import { EmptyObject, XyoObjectWrapper } from '../lib'
import { removeEmptyFields } from './removeEmptyFields'
import { deepOmitUnderscoreFields } from './removeFields'
import { sortFields } from './sortFields'

export class XyoHasher<T extends EmptyObject = EmptyObject> extends XyoObjectWrapper<T> {
  get hashFields() {
    return removeEmptyFields(deepOmitUnderscoreFields(this.obj))
  }

  /** @deprecated use stringified instead */
  public sortedStringify() {
    return this.stringified
  }

  public get stringified() {
    const sortedEntry = sortFields(this.hashFields)
    return JSON.stringify(sortedEntry)
  }

  /** @deprecated use hash instead */
  public sortedHash() {
    return this.hash
  }

  public get hash() {
    return this.sortedHashData().toString('hex')
  }

  private sortedHashData() {
    const stringObject = this.stringified
    return shajs('sha256').update(stringObject).digest()
  }
}
