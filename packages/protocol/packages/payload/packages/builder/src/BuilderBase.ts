import { assertEx } from '@xylabs/assert'
import { Hash } from '@xylabs/hex'
import { AnyObject, isJsonObject, JsonObject, toJson } from '@xylabs/object'
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
    this._fields = removeEmptyFields(fields ?? {}) as Omit<T, 'schema' | '$hash' | '$meta'>
    this._$meta = meta
  }

  static dataHashableFields<T extends Payload = Payload<AnyObject>>(
    schema: string,
    fields?: Omit<T, 'schema' | '$hash' | '$meta'>,
  ): Promisable<Omit<T, '$hash' | '$meta'>> {
    const cleanFields = fields ? removeEmptyFields(fields) : undefined
    assertEx(
      cleanFields === undefined || isJsonObject(cleanFields),
      () => `Fields must be JsonObject: ${JSON.stringify(toJson(cleanFields), null, 2)}`,
    )
    return deepOmitPrefixedFields(deepOmitPrefixedFields({ schema, ...cleanFields }, '$'), '_') as T
  }

  protected static metaFields(dataHash: Hash, otherMeta?: JsonObject): Promisable<JsonObject> {
    const meta: JsonObject = { ...otherMeta }

    meta.timestamp = meta.timestamp ?? Date.now()

    return meta
  }

  $meta(meta?: JsonObject) {
    this._$meta = meta ?? (this._fields as WithMeta<T>).$meta
    return this
  }

  async dataHashableFields() {
    return await PayloadBuilderBase.dataHashableFields(assertEx(this._schema, 'Payload: Missing Schema'), this._fields)
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

  schema(value: Schema) {
    this._schema = value
  }

  protected async metaFields(dataHash: Hash): Promise<JsonObject> {
    return await PayloadBuilderBase.metaFields(dataHash, this._$meta)
  }
}
