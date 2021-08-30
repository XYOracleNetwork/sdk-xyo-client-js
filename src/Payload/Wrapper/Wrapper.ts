import { XyoPayload } from '../../models'
import sortedHash from '../../sortedHash'
import sortedStringify from '../../sortedStringify'
import { XyoPayloadValidator } from '../Validator'

class XyoPayloadWrapper<T extends XyoPayload> {
  public readonly payload: T
  constructor(payload: T) {
    this.payload = payload
  }

  private _validator?: XyoPayloadValidator
  get validator() {
    this._validator = this._validator ?? new XyoPayloadValidator(this.payload)
    return this._validator
  }

  public sortedStringify() {
    return sortedStringify(this.payload)
  }

  public hash() {
    return sortedHash(this.payload)
  }
}

export default XyoPayloadWrapper
