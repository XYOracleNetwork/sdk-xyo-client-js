import { assertEx } from '@xylabs/assert'
import { deepOmitUnderscoreFields, PayloadHasher, removeEmptyFields } from '@xyo-network/hash'
import { AnyObject } from '@xyo-network/object'
import { Payload } from '@xyo-network/payload-model'

export interface PayloadBuilderOptions {
  schema: string
}

export class PayloadBuilder<T extends Payload = Payload<AnyObject>> {
  private _$meta?: AnyObject
  private _client = 'js'
  private _fields: Partial<T> = {}
  private _schema: string
  private _timestamp = Date.now()

  constructor({ schema }: PayloadBuilderOptions) {
    this._schema = schema
  }

  get externalMeta() {
    const _hash = PayloadHasher.hashAsync(this.hashableFields)
    return { _client: this._client, _hash, _timestamp: this._timestamp }
  }

  get schema() {
    this._schema = this._schema ?? this._fields['schema']
    return this._schema
  }

  $meta(fields?: AnyObject) {
    this._$meta = fields
    return this
  }

  async build(withExternalMeta = false) {
    let hashableFields = this.hashableFields()
    if (this._$meta) {
      const $hash = await PayloadHasher.hashAsync(hashableFields)
      hashableFields = { ...hashableFields, $hash, $meta: this._$meta }
    }
    return withExternalMeta ? { ...hashableFields, ...this.externalMeta } : hashableFields
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
      schema: assertEx(this.schema, 'Payload: Missing Schema'),
    } as T
  }
}
