import { XyoPayload } from '../../models'
import BodyValidator from './BodyValidator'
import MetaValidator from './MetaValidator'

class Validator {
  private payload: XyoPayload
  public body: BodyValidator
  public meta: MetaValidator
  constructor(payload: XyoPayload) {
    this.payload = payload
    this.body = new BodyValidator(payload)
    this.meta = new MetaValidator(payload)
  }

  public all() {
    const errors: Error[] = []
    errors.push(...this.meta.all(), ...this.body.all())
    return errors
  }
}

export default Validator
