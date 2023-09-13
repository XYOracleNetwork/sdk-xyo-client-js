import { deepOmitUnderscoreFields, PayloadHasher, removeEmptyFields } from '@xyo-network/core'
import { Payload, Schema } from '@xyo-network/payload-model'

export interface PayloadBuilderOptions {
  schema: Schema
}

export class PayloadBuilder<T extends Payload = Payload> {
  private _client = 'js'
  private _fields: Partial<T> = {}
  private _schema: string
  private _timestamp = Date.now()

  constructor({ schema }: PayloadBuilderOptions) {
    this._schema = schema
  }

  get hashableFields() {
    return {
      ...removeEmptyFields(deepOmitUnderscoreFields(this._fields)),
      schema: this._schema,
    } as T
  }

  async build(withMeta = false): Promise<T> {
    const hashableFields = this.hashableFields
    if (withMeta) {
      return { ...hashableFields, ...(await this.meta()) }
    } else {
      return hashableFields
    }
  }

  fields(fields?: Partial<Omit<T, 'schema'>>) {
    if (fields) {
      this._fields = { ...this._fields, ...removeEmptyFields(fields) }
    }
    return this
  }

  async meta() {
    const _hash = await PayloadHasher.hashAsync(this.hashableFields)
    return { _client: this._client, _hash, _timestamp: this._timestamp, schema: this._schema }
  }
}
