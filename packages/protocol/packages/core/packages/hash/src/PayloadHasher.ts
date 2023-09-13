import { Payload } from '@xyo-network/payload-model'

import { ObjectHasher } from './ObjectHasher'
import { removeEmptyFields } from './removeEmptyFields'
import { deepOmitUnderscoreFields } from './removeFields'

export class PayloadHasher<T extends Payload = Payload> extends ObjectHasher<T> {
  static override hashFields<T extends object>(obj: T): T {
    const rootFields: T = super.hashFields(obj)
    const omittedUnderscores: T = deepOmitUnderscoreFields(rootFields)
    return removeEmptyFields(omittedUnderscores)
  }
}
