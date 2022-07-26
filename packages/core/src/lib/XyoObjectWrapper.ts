import { EmptyObject } from './EmptyObject'
import { StringKeyObject } from './StringKeyObject'

export abstract class XyoObjectWrapper<T extends EmptyObject = EmptyObject> {
  public readonly obj: T
  constructor(obj: T) {
    this.obj = obj
  }
  protected get stringKeyObj() {
    return this.obj as StringKeyObject
  }
}
