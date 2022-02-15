import shajs from 'sha.js'

import { XyoPayload } from '../../models'
import { sortedStringify } from '../../sortedStringify'
import { removeEmptyFields, removeUnderscoreFields } from '../../XyoHasher'

export interface XyoPayloadBuilderOptions {
  schema: string
}

export class XyoPayloadBuilder<T extends XyoPayload> {
  private _fields: Partial<T> = {}
  private _schema: string

  constructor({ schema }: XyoPayloadBuilderOptions) {
    this._schema = schema
  }

  public fields(fields?: Partial<T>) {
    if (fields) {
      this._fields = { ...this._fields, ...fields }
    }
    return this
  }

  public hashableFields() {
    return {
      ...removeEmptyFields(removeUnderscoreFields(this._fields)),
      schema: this._schema,
    } as T
  }

  public build(): T {
    const hashableFields = this.hashableFields()
    const _hash = XyoPayloadBuilder.hash(hashableFields)
    const _timestamp = Date.now()
    return { ...hashableFields, _client: 'js', _hash, _timestamp, schema: this._schema }
  }

  static hash<T extends Record<string, unknown>>(obj: T) {
    const stringObject = sortedStringify<T>(obj)
    return shajs('sha256').update(stringObject).digest('hex')
  }
}
