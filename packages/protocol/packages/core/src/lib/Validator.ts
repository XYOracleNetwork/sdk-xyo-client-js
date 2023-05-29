import { Promisable } from '@xyo-network/promise'

import { AnyObject } from './AnyObject'
import { ObjectWrapper } from './ObjectWrapper'

export interface Validator<T extends AnyObject = AnyObject> {
  validate(payload: T): Promisable<Error[]>
}

export abstract class XyoValidatorBase<T extends AnyObject = AnyObject> extends ObjectWrapper<T> implements Validator<T> {
  abstract validate(payload: T): Promisable<Error[]>
}
