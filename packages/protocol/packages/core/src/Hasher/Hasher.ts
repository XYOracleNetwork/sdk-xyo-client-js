import { sha256 } from 'hash-wasm'
import shajs from 'sha.js'

import { AnyObject, ObjectWrapper } from '../lib'
import { removeEmptyFields } from './removeEmptyFields'
import { deepOmitUnderscoreFields } from './removeFields'
import { sortFields } from './sortFields'

export class Hasher<T extends AnyObject = AnyObject> extends ObjectWrapper<T> {
  static allowWasm = true
  static wasmSupported = true

  get hash() {
    return Hasher.hash(this.obj)
  }

  get hashFields() {
    return Hasher.hashFields(this.obj)
  }

  get stringified() {
    return Hasher.stringify(this.obj)
  }

  static hash<T extends AnyObject>(obj: T) {
    return shajs('sha256').update(this.stringify(obj)).digest().toString('hex')
  }

  static async hashAsync<T extends AnyObject>(obj: T): Promise<string> {
    if (this.allowWasm && this.wasmSupported) {
      try {
        return await sha256(this.stringify(obj))
      } catch (ex) {
        this.wasmSupported = false
      }
    }
    return this.hash(obj)
  }

  static hashFields<T extends AnyObject>(obj: T) {
    return removeEmptyFields(deepOmitUnderscoreFields(obj))
  }

  static stringify<T extends AnyObject>(obj: T) {
    return JSON.stringify(sortFields(this.hashFields(obj)))
  }

  hashAsync() {
    return Hasher.hashAsync(this.obj)
  }
}
