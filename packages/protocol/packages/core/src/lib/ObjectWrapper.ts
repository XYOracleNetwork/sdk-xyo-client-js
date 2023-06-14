import { EmptyObject } from './EmptyObject'
import { StringKeyObject } from './StringKeyObject'

export abstract class ObjectWrapper<T extends EmptyObject = EmptyObject> {
  readonly obj: T
  constructor(obj: T) {
    this.obj = obj
  }
  protected get stringKeyObj() {
    return this.obj as StringKeyObject
  }
}
