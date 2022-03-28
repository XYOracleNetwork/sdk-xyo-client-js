import { XyoPayload } from '../models'
import { XyoPayloadBodyValidator } from './BodyValidator'
import { XyoPayloadMetaValidator } from './MetaValidator'

class XyoPayloadValidator {
  private payload: XyoPayload
  public body: XyoPayloadBodyValidator
  public meta: XyoPayloadMetaValidator
  constructor(payload: XyoPayload) {
    this.payload = payload
    this.body = new XyoPayloadBodyValidator(payload)
    this.meta = new XyoPayloadMetaValidator(payload)
  }

  public all() {
    const errors: Error[] = []
    errors.push(...this.meta.all(), ...this.body.all())
    return errors
  }
}

export { XyoPayloadValidator }
