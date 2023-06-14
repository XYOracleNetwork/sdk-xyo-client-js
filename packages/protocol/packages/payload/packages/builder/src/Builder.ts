import { deepOmitUnderscoreFields, PayloadHasher, removeEmptyFields } from '@xyo-network/core'
import { Payload } from '@xyo-network/payload-model'

export interface PayloadBuilderOptions {
  schema: string
}

export class PayloadBuilder<T extends Payload = Payload<Record<string, unknown>>> {
  private _client = 'js'
  private _fields: Partial<T> = {}
  private _schema: string
  private _timestamp = Date.now()

  constructor({ schema }: PayloadBuilderOptions) {
    this._schema = schema
  }

  get meta() {
    const _hash = PayloadHasher.hashAsync(this.hashableFields)
    return { _client: this._client, _hash, _timestamp: this._timestamp, schema: this._schema }
  }

  build(withMeta = false) {
    const hashableFields = this.hashableFields()
    if (withMeta) {
      return { ...hashableFields, ...this.meta }
    } else {
      return hashableFields
    }
  }

  fields(fields?: Partial<T>) {
    if (fields) {
      this._fields = { ...this._fields, ...removeEmptyFields(fields) }
    }
    return this
  }

  hashableFields() {
    return {
      ...removeEmptyFields(deepOmitUnderscoreFields(this._fields)),
      schema: this._schema,
    } as T
  }
}
