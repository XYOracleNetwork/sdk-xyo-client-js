import shajs from 'sha.js'

import { XyoPayload } from '../../models'
import { sortObject } from '../../sortObject'

export interface XyoPayloadBuilderOptions {
  schema: string
}

export class XyoPayloadBuilder {
  private _fields?: Record<string, unknown> = {}
  private _schema: string

  constructor({ schema }: XyoPayloadBuilderOptions) {
    this._schema = schema
  }

  public fields(fields: Record<string, unknown>) {
    this._fields = { ...this._fields, ...fields }
    return this
  }

  public hashableFields(): XyoPayload {
    return {
      ...this._fields,
      schema: this._schema,
    }
  }

  public build(): XyoPayload {
    const hashableFields = this.hashableFields() as unknown as Record<string, unknown>
    const _hash = XyoPayloadBuilder.hash(hashableFields)
    const _timestamp = Date.now()
    return { ...hashableFields, _client: 'js', _hash, _timestamp, schema: this._schema } as XyoPayload
  }

  static sortedStringify<T extends Record<string, unknown>>(obj: T) {
    const sortedEntry = sortObject<T>(obj)
    return JSON.stringify(sortedEntry)
  }

  static hash<T extends Record<string, unknown>>(obj: T) {
    const stringObject = XyoPayloadBuilder.sortedStringify<T>(obj)
    return shajs('sha256').update(stringObject).digest('hex')
  }
}
