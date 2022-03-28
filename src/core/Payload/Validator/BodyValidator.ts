import { SchemaValidator } from '../../../SchemaNameValidator'
import { WithStringIndex } from '../../models'
import { XyoPayloadBody } from '../models'

class XyoPayloadBodyValidator {
  private body: WithStringIndex<XyoPayloadBody>
  constructor(body: XyoPayloadBody) {
    this.body = body as WithStringIndex<XyoPayloadBody>
  }

  private _schemaValidator?: SchemaValidator
  get schemaValidator() {
    this._schemaValidator = this._schemaValidator ?? new SchemaValidator(this.body.schema ?? '')
    return this._schemaValidator
  }

  public schemaName() {
    const errors: Error[] = []
    if (this.body.schema === undefined) {
      errors.push(Error('schema missing'))
    } else {
      errors.push(...this.schemaValidator.all())
    }
    return errors
  }

  public all() {
    const errors: Error[] = []
    errors.push(...this.schemaName())
    return errors
  }
}

export { XyoPayloadBodyValidator }
