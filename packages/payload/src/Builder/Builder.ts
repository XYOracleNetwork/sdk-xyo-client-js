import { deepOmitUnderscoreFields, removeEmptyFields, XyoHasher } from '@xyo-network/core'

import { XyoPayload } from '../models'

export interface XyoPayloadBuilderOptions {
  schema: string
}

export class XyoPayloadBuilder<T extends XyoPayload = XyoPayload<Record<string, unknown>>> {
  private _fields: Partial<T> = {}
  private _previousHash?: string
  private _schema: string

  constructor({ schema }: XyoPayloadBuilderOptions) {
    this._schema = schema
  }

  public fields(fields?: Partial<T>) {
    if (fields) {
      this._fields = { ...this._fields, ...removeEmptyFields(fields) }
    }
    return this
  }

  public previousHash(hash?: string) {
    this._previousHash = hash
    return this
  }

  public hashableFields() {
    return {
      ...removeEmptyFields(deepOmitUnderscoreFields({ ...this._fields, previousHash: this._previousHash })),
      schema: this._schema,
    } as T
  }

  public build(): T {
    const hashableFields = this.hashableFields()
    const _hash = new XyoHasher(hashableFields).hash
    const _timestamp = Date.now()
    return { ...hashableFields, _client: 'js', _hash, _timestamp, schema: this._schema }
  }
}
