import { Validator, XyoValidatorBase } from '@xyo-network/core'
import { XyoPayload } from '@xyo-network/payload-model'

export type AllValidator = {
  all(): Error[]
}

export type AllValidatorFactory = (schema: string) => AllValidator

export class PayloadValidator<T extends XyoPayload = XyoPayload> extends XyoValidatorBase<T> implements Validator<T> {
  protected static schemaNameValidatorFactory: AllValidatorFactory | null = null
  protected payload: XyoPayload

  private _schemaValidator?: AllValidator

  constructor(payload: T) {
    super(payload)
    this.payload = payload
  }

  get schemaValidator() {
    this._schemaValidator = this._schemaValidator ?? PayloadValidator.schemaNameValidatorFactory?.(this.payload.schema)
    if (!this._schemaValidator) {
      console.warn('No schema name validator set')
    }
    return this._schemaValidator
  }

  public static setSchemaNameValidatorFactory(factory: AllValidatorFactory | null) {
    this.schemaNameValidatorFactory = factory
  }

  public schemaName() {
    const errors: Error[] = []
    if (this.obj.schema === undefined) {
      errors.push(Error('schema missing'))
    } else {
      errors.push(...(this.schemaValidator?.all() ?? []))
    }
    return errors
  }

  public validate() {
    const errors: Error[] = []
    errors.push(...this.schemaName())
    return errors
  }
}
