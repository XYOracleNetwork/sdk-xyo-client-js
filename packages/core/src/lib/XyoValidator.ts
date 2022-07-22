import { XyoObjectWrapper } from './XyoObjectWrapper'

export abstract class XyoValidator<T extends object = object> extends XyoObjectWrapper<T> {
  public abstract validate(payload: T): Error[]
}
