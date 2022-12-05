import { deepOmitUnderscoreFields, Hasher, removeEmptyFields } from '@xyo-network/core'

import { XyoPayload } from '../models'

export interface XyoPayloadBuilderOptions {
  schema: string
}

export class XyoPayloadBuilder<T extends XyoPayload = XyoPayload> {
  private _fields: Partial<T> = {}
  private _schema: string

  constructor({ schema }: XyoPayloadBuilderOptions) {
    this._schema = schema
  }

  public build(): T {
    const hashableFields = this.hashableFields()
    const _hash = new Hasher(hashableFields).hash
    const _timestamp = Date.now()
    return { ...hashableFields, _client: 'js', _hash, _timestamp, schema: this._schema }
  }

  public fields(fields?: Partial<T>) {
    if (fields) {
      this._fields = { ...this._fields, ...removeEmptyFields(fields) }
    }
    return this
  }

  public hashableFields() {
    return {
      ...removeEmptyFields(deepOmitUnderscoreFields(this._fields)),
      schema: this._schema,
    } as T
  }
}
