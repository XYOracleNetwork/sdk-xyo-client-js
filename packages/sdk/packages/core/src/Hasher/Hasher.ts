import shajs from 'sha.js'

import { EmptyObject, XyoObjectWrapper } from '../lib'
import { removeEmptyFields } from './removeEmptyFields'
import { deepOmitUnderscoreFields } from './removeFields'
import { sortFields } from './sortFields'

export class Hasher<T extends EmptyObject = EmptyObject> extends XyoObjectWrapper<T> {
  get hashFields() {
    return Hasher.hashFields(this.obj)
  }

  /** @deprecated use stringified instead */
  public sortedStringify() {
    return this.stringified
  }

  public get stringified() {
    return Hasher.stringify(this.obj)
  }

  /** @deprecated use hash instead */
  public sortedHash() {
    return this.hash
  }

  public get hash() {
    return Hasher.hash(this.obj)
  }

  public static hashFields<T extends EmptyObject>(obj: T) {
    return removeEmptyFields(deepOmitUnderscoreFields(obj))
  }

  public static stringify<T extends EmptyObject>(obj: T) {
    return JSON.stringify(sortFields(this.hashFields(obj)))
  }

  private static sortedHashData<T extends EmptyObject>(obj: T) {
    return shajs('sha256').update(this.stringify(obj)).digest()
  }

  public static hash<T extends EmptyObject>(obj: T) {
    return this.sortedHashData(obj).toString('hex')
  }
}
