import pick from 'lodash/pick'

import { XyoPayload } from '../../models'
import sortedHash from '../../sortedHash'
import sortedStringify from '../../sortedStringify'
import { XyoPayloadValidator } from '../Validator'

const hashFields = ['addresses', 'payload_schemas', 'previous_hashes']

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

  get hashFields() {
    return pick(this.payload, hashFields)
  }

  public sortedStringify() {
    return sortedStringify(this.payload)
  }

  public sortedHash() {
    return sortedHash(this.payload)
  }
}

export default XyoPayloadWrapper
