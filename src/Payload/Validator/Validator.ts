import { XyoPayload } from '../../models'
import SchemaValidator from '../../SchemaValidator'

class Validator {
  private payload: XyoPayload
  constructor(payload: XyoPayload) {
    this.payload = payload
  }

  private _schemaValidator?: SchemaValidator
  get schemaValidator() {
    this._schemaValidator = this._schemaValidator ?? new SchemaValidator(this.payload.schema ?? '')
    return this._schemaValidator
  }

  public async allDynamic() {
    const errors: Error[] = []
    errors.push(...(await this.schemaValidator.allDynamic()))
    return errors
  }

  public all() {
    const errors: Error[] = []
    errors.push(...this.schemaValidator.all())
    return errors
  }
}

export default Validator
