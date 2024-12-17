import { assertEx } from '@xylabs/assert'
import type { AnyObject, EmptyObject } from '@xylabs/object'
import {
  isJsonObject, omitByPrefix, pickByPrefix, toJson,
} from '@xylabs/object'
import type { Promisable } from '@xylabs/promise'
import { removeEmptyFields } from '@xyo-network/hash'
import type {
  Payload, Schema,
  WithOnlyClientMeta,
  WithOptionalSchema,
  WithoutClientMeta,
  WithoutMeta,
  WithoutPrivateStorageMeta,
  WithoutSchema,
  WithoutStorageMeta,
} from '@xyo-network/payload-model'

import type { PayloadBuilderOptions } from './Options.ts'

export const omitSchema = <T extends WithOptionalSchema>(payload: T): WithoutSchema<T> => {
  const result = structuredClone(payload)
  delete result.schema
  return result
}

export class PayloadBuilderBase<T extends Payload = Payload<AnyObject>,
  O extends PayloadBuilderOptions<T> = PayloadBuilderOptions<T>> {
  protected _fields?: WithoutMeta<WithoutSchema<T>>
  protected _meta?: WithOnlyClientMeta<T>
  protected _schema: Schema

  constructor(readonly options: O) {
    const { schema, fields } = options
    this._schema = schema
    if (fields) {
      this.fields(fields)
    }
  }

  static dataHashableFields<T extends Payload>(
    schema: Schema,
    payload: WithoutSchema<T>,

  ): Promisable<WithoutMeta<T>> {
    const cleanFields = removeEmptyFields({ ...payload, schema })
    assertEx(
      cleanFields === undefined || isJsonObject(cleanFields),
      () => `Fields must be JsonObject: ${JSON.stringify(toJson(cleanFields), null, 2)}`,
    )
    return this.omitMeta(cleanFields) as WithoutMeta<T>
  }

  static omitClientMeta<T extends EmptyObject>(payload: T, maxDepth?: number): WithoutClientMeta<T>
  static omitClientMeta<T extends EmptyObject>(payloads: T[], maxDepth?: number): WithoutClientMeta<T>[]
  static omitClientMeta<T extends EmptyObject>(payloads: T | T[], maxDepth = 100): WithoutClientMeta<T> | WithoutClientMeta<T>[] {
    return Array.isArray(payloads)
      ? payloads.map(payload => this.omitClientMeta(payload, maxDepth))
      : omitByPrefix(payloads, '$', maxDepth)
  }

  static omitMeta<T extends EmptyObject>(payload: T, maxDepth?: number): WithoutMeta<T>
  static omitMeta<T extends EmptyObject>(payloads: T[], maxDepth?: number): WithoutMeta<T>[]
  static omitMeta<T extends EmptyObject>(payloads: T | T[], maxDepth = 100): WithoutMeta<T> | WithoutMeta<T>[] {
    return Array.isArray(payloads)
      ? payloads.map(payload => this.omitMeta(payload, maxDepth))
      : this.omitStorageMeta(this.omitClientMeta(payloads, maxDepth), maxDepth) as unknown as WithoutMeta<T>
  }

  static omitPrivateStorageMeta<T extends EmptyObject>(payload: T, maxDepth?: number): WithoutPrivateStorageMeta<T>
  static omitPrivateStorageMeta<T extends EmptyObject>(payloads: T[], maxDepth?: number): WithoutPrivateStorageMeta<T>[]
  static omitPrivateStorageMeta<T extends EmptyObject>(payloads: T | T[], maxDepth = 100): WithoutPrivateStorageMeta<T> | WithoutPrivateStorageMeta<T>[] {
    return Array.isArray(payloads)
      ? payloads.map(payload => this.omitPrivateStorageMeta(payload, maxDepth))
      : omitByPrefix(payloads, '__', maxDepth)
  }

  static omitStorageMeta<T extends EmptyObject>(payload: T, maxDepth?: number): WithoutStorageMeta<T>
  static omitStorageMeta<T extends EmptyObject>(payloads: T[], maxDepth?: number): WithoutStorageMeta<T>[]
  static omitStorageMeta<T extends EmptyObject>(payloads: T | T[], maxDepth = 100): WithoutStorageMeta<T> | WithoutStorageMeta<T>[] {
    return Array.isArray(payloads)
      ? payloads.map(payload => this.omitStorageMeta(payload, maxDepth))
      : omitByPrefix(payloads, '_', maxDepth)
  }

  async dataHashableFields() {
    return await PayloadBuilderBase.dataHashableFields(
      assertEx(this._schema, () => 'Payload: Missing Schema'),
      // TODO: Add verification that required fields are present
      this._fields as WithoutSchema<T>,
    )
  }

  fields(fields: WithoutMeta<WithoutSchema<T>>) {
    // we need to do the cast here since ts seems to not like nested, yet same, generics
    this._fields = omitSchema(PayloadBuilderBase.omitMeta(removeEmptyFields(structuredClone(fields)))) as unknown as WithoutMeta<WithoutSchema<T>>
    return this
  }

  meta(meta: WithOnlyClientMeta<T>) {
    // we need to do the cast here since ts seems to not like nested, yet same, generics
    this._meta = pickByPrefix(meta, '$') as WithOnlyClientMeta<T>
    return this
  }

  schema(value: Schema) {
    this._schema = value
  }
}
