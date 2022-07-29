import { EmptyObject } from './EmptyObject'
import { XyoObjectWrapper } from './XyoObjectWrapper'

export interface XyoValidator<T extends EmptyObject = EmptyObject> {
  validate(payload: T): Error[]
}

export abstract class XyoValidatorBase<T extends EmptyObject = EmptyObject> extends XyoObjectWrapper<T> implements XyoValidator<T> {
  public abstract validate(payload: T): Error[]
}
