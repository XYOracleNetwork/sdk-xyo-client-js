import { XyoValidator } from '../../lib'
import { XyoPayload } from '../../models'
import { XyoSchemaNameValidator } from '../../SchemaNameValidator'

export class XyoPayloadBodyValidator<T extends XyoPayload = XyoPayload> extends XyoValidator<T> {
  private _schemaValidator?: XyoSchemaNameValidator
  get schemaValidator() {
    this._schemaValidator = this._schemaValidator ?? new XyoSchemaNameValidator(this.obj.schema ?? '')
    return this._schemaValidator
  }

  public schemaName() {
    const errors: Error[] = []
    if (this.obj.schema === undefined) {
      errors.push(Error('schema missing'))
    } else {
      errors.push(...this.schemaValidator.all())
    }
    return errors
  }

  public validate() {
    const errors: Error[] = []
    errors.push(...this.schemaName())
    return errors
  }
}
