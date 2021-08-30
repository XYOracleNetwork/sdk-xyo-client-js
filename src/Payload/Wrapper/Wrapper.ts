import { XyoPayload } from '../../models'
import sortedHash from '../../sortedHash'
import sortedStringify from '../../sortedStringify'
import { XyoPayloadValidator } from '../Validator'

const removeUnderscoreFields = (obj: Record<string, unknown>) => {
  const fields: Record<string, unknown> = {}
  Object.keys(obj).forEach((key) => {
    if (!key.startsWith('_')) {
      fields[key] = obj[key]
    }
  })
  return fields
}

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
    return removeUnderscoreFields(this.payload)
  }

  public sortedStringify() {
    return sortedStringify(this.payload)
  }

  public sortedHash() {
    return sortedHash(this.payload)
  }
}

export default XyoPayloadWrapper
