import type { EmptyObject, Validator } from '@xylabs/object'
import { ValidatorBase } from '@xylabs/object'
import type { Promisable } from '@xylabs/promise'
import type { Payload, Schema } from '@xyo-network/payload-model'
import { SchemaNameValidator } from '@xyo-network/schema-name-validator'

export type AllValidator = {
  all(): Error[]
}

export type AllValidatorFactory = (schema: string) => AllValidator

const defaultSchemaNameValidatorFactory: AllValidatorFactory = (schema: string) => new SchemaNameValidator(schema)

export class PayloadValidator<TFields extends Payload | EmptyObject = Payload,
  TSchema extends Schema = TFields extends Payload ? TFields['schema'] : Schema>
  extends ValidatorBase<Payload<TFields, TSchema>>
  implements Validator<Payload<TFields, TSchema>> {
  protected static schemaNameValidatorFactory: AllValidatorFactory = defaultSchemaNameValidatorFactory
  protected payload: Payload

  private _schemaValidator?: AllValidator

  constructor(payload: Payload<TFields, TSchema>) {
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
      errors.push(new Error('schema missing'))
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
