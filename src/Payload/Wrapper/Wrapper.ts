import { XyoPayload } from '../../models'
import { XyoPayloadValidator } from '../Validator'

class XyoBoundWitnessWrapper {
  public readonly payload: XyoPayload
  constructor(payload: XyoPayload) {
    this.payload = payload
  }

  private _validator?: XyoPayloadValidator
  get validator() {
    this._validator = this._validator ?? new XyoPayloadValidator(this.payload)
    return this._validator
  }
}

export default XyoBoundWitnessWrapper
