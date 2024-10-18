import { assertEx } from '@xylabs/assert'
import type { Hash } from '@xylabs/hex'
import type { AnyObject, JsonObject } from '@xylabs/object'
import {
  isJsonObject, omitBy, toJson,
} from '@xylabs/object'
import type { Promisable } from '@xylabs/promise'
import { removeEmptyFields } from '@xyo-network/hash'
import type {
  Payload, Schema, WithMeta, WithOptionalMeta,
} from '@xyo-network/payload-model'

import type { PayloadBuilderOptions } from './Options.ts'

export type WithOptionalSchema<T extends Payload> = Omit<T, 'schema'> & Partial<T>

export type WithoutSchema<T extends WithOptionalSchema<Payload>> = Omit<T, 'schema'>

export type WithoutMeta<T extends WithOptionalMeta<Payload>> = Omit<T, '$hash' | '$meta'>

export const removeMetaAndSchema = <T extends Payload>(payload: WithOptionalSchema<WithOptionalMeta<T>>): WithoutSchema<WithoutMeta<T>> => {
  const { ...result } = payload
  delete result.$hash
  delete result.$meta
  delete result.schema
  return result as Omit<T, 'schema'>
}

const omitByPredicate = (prefix: string) => (_: unknown, key: string) => {
  assertEx(typeof key === 'string', () => `Invalid key type [${key}, ${typeof key}]`)
  return key.startsWith(prefix)
}

export class PayloadBuilderBase<T extends Payload = Payload<AnyObject>, O extends PayloadBuilderOptions<T> = PayloadBuilderOptions<T>> {
  protected _$meta?: JsonObject
  protected _fields?: WithoutSchema<WithoutMeta<T>>
  protected _schema: Schema

  constructor(readonly options: O) {
    const {
      schema, fields, meta,
    } = options
    this._schema = schema
    this._fields = removeEmptyFields(fields ?? {}) as WithoutSchema<WithoutMeta<T>>
    this._$meta = meta
  }

  static dataHashableFields<T extends Payload = Payload<AnyObject>>(
    schema: string,
    fields?: WithoutSchema<WithoutMeta<T>>,
  ): Promisable<Omit<T, '$hash' | '$meta'>> {
    const cleanFields = fields ? removeEmptyFields(fields) : undefined
    assertEx(
      cleanFields === undefined || isJsonObject(cleanFields),
      () => `Fields must be JsonObject: ${JSON.stringify(toJson(cleanFields), null, 2)}`,
    )
    return omitBy(omitBy({ schema, ...cleanFields }, omitByPredicate('$')), omitByPredicate('_')) as unknown as T
  }

  protected static metaFields(dataHash: Hash, otherMeta?: JsonObject, stamp = true): Promisable<JsonObject> {
    const meta: JsonObject = { ...otherMeta }

    if (!meta.timestamp && stamp) {
      meta.timestamp = meta.timestamp ?? Date.now()
    }

    return meta
  }

  $meta(meta?: JsonObject) {
    this._$meta = meta ?? (this._fields as WithMeta<T>).$meta
    return this
  }

  async dataHashableFields() {
    return await PayloadBuilderBase.dataHashableFields(
      assertEx(this._schema, () => 'Payload: Missing Schema'),
      this._fields,
    )
  }

  // we do not require sending in $hash since it will be generated anyway
  fields(fields: WithOptionalSchema<WithOptionalMeta<T>>) {
    if (fields) {
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        $meta, $hash, schema, ...fieldsOnly
      } = fields
      if ($meta) {
        this.$meta($meta)
      }
      if (schema) {
        this.schema(schema)
      }
      this._fields = removeMetaAndSchema<T>(fields)
    }
    return this
  }

  schema(value: Schema) {
    this._schema = value
  }

  protected async metaFields(dataHash: Hash, stamp = true): Promise<JsonObject> {
    return await PayloadBuilderBase.metaFields(dataHash, this._$meta, stamp)
  }
}
