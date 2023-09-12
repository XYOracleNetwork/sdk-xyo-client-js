import { AnyObject, ObjectWrapper } from '@xyo-network/object'
import { Promisable } from '@xyo-network/promise'

export interface Validator<T extends AnyObject = AnyObject> {
  validate(payload: T): Promisable<Error[]>
}

export abstract class ValidatorBase<T extends AnyObject = AnyObject> extends ObjectWrapper<T> implements Validator<T> {
  abstract validate(payload: T): Promisable<Error[]>
}
