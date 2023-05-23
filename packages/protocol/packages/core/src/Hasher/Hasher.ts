import { forget } from '@xylabs/forget'
import shajs from 'sha.js'
import Sha256Wasm from 'sha256-wasm'

import { AnyObject, ObjectWrapper } from '../lib'
import { removeEmptyFields } from './removeEmptyFields'
import { deepOmitUnderscoreFields } from './removeFields'
import { sortFields } from './sortFields'

export class Hasher<T extends AnyObject = AnyObject> extends ObjectWrapper<T> {
  static allowWasm = false
  private static initialized = false

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
    return this.sortedHashData(obj).toString('hex')
  }

  static hashFields<T extends AnyObject>(obj: T) {
    return removeEmptyFields(deepOmitUnderscoreFields(obj))
  }

  static async initialize() {
    if (!this.initialized) {
      if (Sha256Wasm.WASM_SUPPORTED) {
        await Sha256Wasm.ready()
      }
      this.initialized = true
    }
  }

  static sortedHashData<T extends AnyObject>(obj: T): Buffer {
    if (Sha256Wasm.WASM_SUPPORTED && this.allowWasm) {
      return Buffer.from(
        Sha256Wasm()
          .update(Buffer.from(this.stringify(obj)))
          .digest(),
      )
    } else {
      return shajs('sha256').update(this.stringify(obj)).digest()
    }
  }

  static stringify<T extends AnyObject>(obj: T) {
    return JSON.stringify(sortFields(this.hashFields(obj)))
  }
}

//initialize static Hasher state
forget(Hasher.initialize())
