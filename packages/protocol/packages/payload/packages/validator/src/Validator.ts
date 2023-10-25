import { Promisable } from '@xylabs/promise'
import { Validator, ValidatorBase } from '@xyo-network/core'
import { Payload } from '@xyo-network/payload-model'
import { SchemaNameValidator } from '@xyo-network/schema-name-validator'

export type AllValidator = {
  all(): Error[]
}

export type AllValidatorFactory = (schema: string) => AllValidator

const defaultSchemaNameValidatorFactory: AllValidatorFactory = (schema: string) => new SchemaNameValidator(schema)

export class PayloadValidator<T extends Payload = Payload> extends ValidatorBase<T> implements Validator<T> {
  protected static schemaNameValidatorFactory: AllValidatorFactory = defaultSchemaNameValidatorFactory
  protected payload: Payload

  private _schemaValidator?: AllValidator

  constructor(payload: T) {
    super(payload)
    this.payload = payload
  }

  get schemaValidator() {
    this._schemaValidator = this._schemaValidator ?? PayloadValidator.schemaNameValidatorFactory?.(this.payload.schema)
    if (!this._schemaValidator) {
      console.warn(`No schema name validator set [${this.payload.schema}]`)
    }
    return this._schemaValidator
  }

  static setSchemaNameValidatorFactory(factory: AllValidatorFactory) {
    this.schemaNameValidatorFactory = factory
  }

  schemaName(): Error[] {
    const errors: Error[] = []
    if (this.obj.schema === undefined) {
      errors.push(Error('schema missing'))
    } else {
      errors.push(...(this.schemaValidator?.all() ?? []))
    }
    return errors
  }

  validate(): Promisable<Error[]> {
    const errors: Error[] = []
    errors.push(...this.schemaName())
    return errors
  }
}
