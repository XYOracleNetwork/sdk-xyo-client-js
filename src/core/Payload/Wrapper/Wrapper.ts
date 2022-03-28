import { deepOmitUnderscoreFields, deepPickUnderscoreFields, XyoHasher } from '../../Hasher'
import { XyoPayload } from '../models'
import { XyoPayloadValidator } from '../Validator'

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

  private _validator?: XyoPayloadValidator
  get validator() {
    this._validator = this._validator ?? new XyoPayloadValidator(this.payload)
    return this._validator
  }
}

export { XyoPayloadWrapper }
