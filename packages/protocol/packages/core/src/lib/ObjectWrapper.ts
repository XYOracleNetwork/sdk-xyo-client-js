import { AnyObject } from './AnyObject'
import { EmptyObject } from './EmptyObject'
import { StringKeyObject } from './StringKeyObject'

export abstract class ObjectWrapper<T extends AnyObject = EmptyObject> {
  readonly obj: T
  constructor(obj: T) {
    this.obj = obj
  }
  protected get stringKeyObj() {
    return this.obj as StringKeyObject
  }
}

export class XyoObjectWrapper extends ObjectWrapper {}
