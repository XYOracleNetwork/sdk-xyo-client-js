import { AnyObject } from './AnyObject'
import { StringKeyObject } from './StringKeyObject'

export abstract class ObjectWrapper<T extends AnyObject = AnyObject> {
  readonly obj: T
  constructor(obj: T) {
    this.obj = obj
  }
  protected get stringKeyObj() {
    return this.obj as StringKeyObject
  }
}
