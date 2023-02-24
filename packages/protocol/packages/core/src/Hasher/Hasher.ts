import shajs from 'sha.js'

import { EmptyObject, ObjectWrapper } from '../lib'
import { removeEmptyFields } from './removeEmptyFields'
import { deepOmitUnderscoreFields } from './removeFields'
import { sortFields } from './sortFields'

export class Hasher<T extends EmptyObject = EmptyObject> extends ObjectWrapper<T> {
  get hash() {
    return Hasher.hash(this.obj)
  }

  get hashFields() {
    return Hasher.hashFields(this.obj)
  }

  get stringified() {
    return Hasher.stringify(this.obj)
  }

  static hash<T extends EmptyObject>(obj: T) {
    return this.sortedHashData(obj).toString('hex')
  }

  static hashFields<T extends EmptyObject>(obj: T) {
    return removeEmptyFields(deepOmitUnderscoreFields(obj))
  }

  static stringify<T extends EmptyObject>(obj: T) {
    return JSON.stringify(sortFields(this.hashFields(obj)))
  }

  private static sortedHashData<T extends EmptyObject>(obj: T) {
    return shajs('sha256').update(this.stringify(obj)).digest()
  }
}
