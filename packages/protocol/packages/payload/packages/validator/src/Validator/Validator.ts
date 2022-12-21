import { Validator, XyoValidatorBase } from '@xyo-network/core'
import { XyoPayload } from '@xyo-network/payload-model'

import { XyoSchemaNameValidator } from '../SchemaNameValidator'

export class PayloadValidator<T extends XyoPayload = XyoPayload> extends XyoValidatorBase<T> implements Validator<T> {
  private _schemaValidator?: XyoSchemaNameValidator

  constructor(payload: T) {
    super(payload)
  }

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
