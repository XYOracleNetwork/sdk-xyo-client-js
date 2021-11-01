import { WithStringIndex, XyoPayloadBody } from '../../models'
import SchemaValidator from '../../SchemaValidator'

class BodyValidator {
  private body: WithStringIndex<XyoPayloadBody>
  constructor(body: XyoPayloadBody) {
    this.body = body as WithStringIndex<XyoPayloadBody>
  }

  private _schemaValidator?: SchemaValidator
  get schemaValidator() {
    this._schemaValidator = this._schemaValidator ?? new SchemaValidator(this.body.schema ?? '')
    return this._schemaValidator
  }

  public schema() {
    const errors: Error[] = []
    if (this.body.schema === undefined) {
      errors.push(new Error('schema missing'))
    }
    return errors
  }

  public all() {
    const errors: Error[] = []
    errors.push(...this.schema())
    return errors
  }
}

export default BodyValidator
