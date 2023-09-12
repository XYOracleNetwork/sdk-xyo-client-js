import { AnyObject } from '@xyo-network/object'

import { ObjectHasher } from './ObjectHasher'
import { removeEmptyFields } from './removeEmptyFields'
import { deepOmitUnderscoreFields } from './removeFields'

export class PayloadHasher<T extends AnyObject = AnyObject> extends ObjectHasher<T> {
  static override hashFields<T extends AnyObject>(obj: T) {
    return removeEmptyFields(deepOmitUnderscoreFields(super.hashFields(obj)))
  }
}
