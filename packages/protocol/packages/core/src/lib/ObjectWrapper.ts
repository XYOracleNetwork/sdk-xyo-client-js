import { AnyObject } from './AnyObject'
import { StringKeyObject } from './StringKeyObject'

export abstract class ObjectWrapper<T extends AnyObject> {
  constructor(readonly obj: T) {}
  protected get stringKeyObj() {
    return this.obj as StringKeyObject
  }
}

export class XyoObjectWrapper<T extends AnyObject> extends ObjectWrapper<T> {}
