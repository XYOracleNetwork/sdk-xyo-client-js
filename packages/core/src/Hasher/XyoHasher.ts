import { XyoAbstractHasher } from './XyoAbstractHasher'

export class XyoHasher<T extends Record<string, unknown>> extends XyoAbstractHasher<T> {
  private readonly memoryObj: T
  constructor(obj: T) {
    super()
    this.memoryObj = obj
  }

  protected get obj() {
    return this.memoryObj
  }
}
