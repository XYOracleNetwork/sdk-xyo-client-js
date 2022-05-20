import { deepOmitUnderscoreFields, deepPickUnderscoreFields, XyoAbstractHasher } from '../../Hasher'
import { XyoPayload } from '../models'

export class XyoPayloadWrapper<T extends XyoPayload> extends XyoAbstractHasher<T> {
  public payload: T
  constructor(payload: T) {
    super()
    this.payload = payload
  }

  protected get obj() {
    return this.payload
  }

  public get body() {
    return deepOmitUnderscoreFields(this.payload)
  }

  public get meta() {
    return deepPickUnderscoreFields(this.payload)
  }
}
