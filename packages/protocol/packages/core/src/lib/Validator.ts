import { Promisable } from '@xylabs/promise'
import { AnyObject, ObjectWrapper } from '@xyo-network/object'

export interface Validator<T extends AnyObject = AnyObject> {
  validate(payload: T): Promisable<Error[]>
}

export abstract class ValidatorBase<T extends AnyObject = AnyObject> extends ObjectWrapper<T> implements Validator<T> {
  abstract validate(payload: T): Promisable<Error[]>
}
