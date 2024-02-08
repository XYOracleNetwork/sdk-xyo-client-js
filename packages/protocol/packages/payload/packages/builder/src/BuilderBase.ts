import { assertEx } from '@xylabs/assert'
import { AnyObject, JsonObject } from '@xylabs/object'
import { Promisable } from '@xylabs/promise'
import { deepOmitPrefixedFields, removeEmptyFields } from '@xyo-network/hash'
import { Payload, Schema, WithMeta } from '@xyo-network/payload-model'

import { PayloadBuilderOptions } from './Options'

export class PayloadBuilderBase<T extends Payload = Payload<AnyObject>, O extends PayloadBuilderOptions<T> = PayloadBuilderOptions<T>> {
  protected _$meta?: JsonObject
  protected _fields?: Omit<T, 'schema' | '$hash' | '$meta'>
  protected _schema: Schema

  constructor(readonly options: O) {
    const { schema, fields, meta } = options
    this._schema = schema
    this._fields = fields
    this._$meta = meta
  }

  $meta(meta?: JsonObject) {
    this._$meta = meta ?? (this._fields as WithMeta<T>).$meta
    return this
  }

  async dataHashableFields(): Promise<T> {
    return deepOmitPrefixedFields(await this.hashableFields(), '$')
  }

  //we do not require sending in $hash since it will be generated anyway
  fields(fields: Omit<WithMeta<T>, '$hash' | 'schema' | '$meta'> & Partial<Pick<WithMeta<T>, '$hash' | 'schema' | '$meta'>>) {
    if (fields) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { $meta, $hash, schema, ...fieldsOnly } = fields
      if ($meta) {
        this.$meta($meta)
      }
      if (schema) {
        this.schema(schema)
      }
      this._fields = { ...this._fields, ...removeEmptyFields(fieldsOnly) } as T
    }
    return this
  }

  hashableFields(): Promisable<T> {
    const schema = assertEx(this._schema, 'Payload: Missing Schema')
    return {
      ...removeEmptyFields(deepOmitPrefixedFields(this._fields ?? {}, '_')),
      schema,
    } as T
  }

  schema(value: Schema) {
    this._schema = value
  }
}
