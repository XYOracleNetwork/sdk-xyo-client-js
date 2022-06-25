import { XyoObject } from './XyoObject'

export abstract class XyoValidator<T extends object = object> extends XyoObject<T> {
  public abstract validate(payload: T): Error[]
}
