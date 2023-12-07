import { Promisable } from '@xylabs/promise'

import { AnyObject } from './AnyObject'
import { EmptyObject } from './EmptyObject'
import { ObjectWrapper } from './ObjectWrapper'

export interface Validator<T extends EmptyObject = AnyObject> {
  validate(payload: T): Promisable<Error[]>
}

export abstract class ValidatorBase<T extends EmptyObject = AnyObject> extends ObjectWrapper<T> implements Validator<T> {
  abstract validate(payload: T): Promisable<Error[]>
}
