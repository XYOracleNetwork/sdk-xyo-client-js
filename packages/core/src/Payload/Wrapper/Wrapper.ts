import { deepOmitUnderscoreFields, deepPickUnderscoreFields, XyoHasher } from '../../Hasher'
import { XyoPayload } from '../models'

class XyoPayloadWrapper<T extends XyoPayload> extends XyoHasher<T> {
  public readonly payload: T
  constructor(payload: T) {
    super(payload)
    this.payload = payload
  }

  public get body() {
    return deepOmitUnderscoreFields(this.payload)
  }

  public get meta() {
    return deepPickUnderscoreFields(this.payload)
  }
}

export { XyoPayloadWrapper }
