import { XyoPayload } from '../../models'
import XyoHasher from '../../XyoHasher'
import { XyoPayloadValidator } from '../Validator'

class XyoPayloadWrapper<T extends XyoPayload> extends XyoHasher<T> {
  public readonly payload: T
  constructor(payload: T) {
    super(payload)
    this.payload = payload
  }

  private _validator?: XyoPayloadValidator
  get validator() {
    this._validator = this._validator ?? new XyoPayloadValidator(this.payload)
    return this._validator
  }
}

export default XyoPayloadWrapper
