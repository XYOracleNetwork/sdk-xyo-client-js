import { EmptyObject } from './EmptyObject'
import { ObjectWrapper } from './ObjectWrapper'

export interface Validator<T extends EmptyObject = EmptyObject> {
  validate(payload: T): Error[]
}

/** @deprecated use Validator instead */
export type XyoValidator<T extends EmptyObject = EmptyObject> = Validator<T>

export abstract class XyoValidatorBase<T extends EmptyObject = EmptyObject> extends ObjectWrapper<T> implements Validator<T> {
  public abstract validate(payload: T): Error[]
}
