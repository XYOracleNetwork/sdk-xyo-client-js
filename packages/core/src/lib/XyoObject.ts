import { StringKeyObject } from './StringKeyObject'

export abstract class XyoObject<T extends object = object> {
  public readonly obj: T
  constructor(obj: T) {
    this.obj = obj
  }
  protected get stringKeyObj() {
    return this.obj as unknown as StringKeyObject
  }
}
