import { assertEx } from '@xylabs/assert'
import type { AnyObject } from '@xylabs/object'
import {
  isJsonObject, omitBy, toJson,
} from '@xylabs/object'
import type { Promisable } from '@xylabs/promise'
import { removeEmptyFields } from '@xyo-network/hash'
import type { Payload, Schema } from '@xyo-network/payload-model'

import { PayloadBuilder } from './Builder.ts'
import type { PayloadBuilderOptions } from './Options.ts'

export type WithOptionalSchema<T extends Payload> = Omit<T, 'schema'> & Partial<T>

export type WithoutSchema<T extends WithOptionalSchema<Payload>> = Omit<T, 'schema'>

export const removeMetaAndSchema = <T extends Payload>(payload: Partial<WithOptionalSchema<T>>): WithoutSchema<T> => {
  const { ...result } = PayloadBuilder.omitMeta(payload as T) as WithOptionalSchema<T>
  delete result.schema
  return result as Omit<T, 'schema'>
}

const omitByPrefixPredicate = (prefix: string) => (_: unknown, key: string) => {
  assertEx(typeof key === 'string', () => `Invalid key type [${key}, ${typeof key}]`)
  return key.startsWith(prefix)
}

export class PayloadBuilderBase<T extends Payload = Payload<AnyObject>, O extends PayloadBuilderOptions<T> = PayloadBuilderOptions<T>> {
  protected _fields?: Partial<WithoutSchema<T>>
  protected _schema: Schema

  constructor(readonly options: O) {
    const { schema, fields } = options
    this._schema = schema
    this._fields = removeMetaAndSchema(removeEmptyFields(structuredClone(fields ?? {})))
  }

  static dataHashableFields<T extends Payload>(
    schema: Schema,
    payload: WithoutSchema<T>,

  ): Promisable<Payload> {
    const cleanFields = removeEmptyFields({ ...payload, schema })
    assertEx(
      cleanFields === undefined || isJsonObject(cleanFields),
      () => `Fields must be JsonObject: ${JSON.stringify(toJson(cleanFields), null, 2)}`,
    )
    return this.omitMeta(cleanFields) as T
  }

  static omitClientMeta<T extends Payload>(payload: T, maxDepth?: number): T
  static omitClientMeta<T extends Payload>(payloads: T[], maxDepth?: number): T[]
  static omitClientMeta<T extends Payload>(payloads: T | T[], maxDepth = 100): T | T[] {
    return Array.isArray(payloads)
      ? payloads.map(payload => this.omitClientMeta(payload, maxDepth)) as T[]
      : omitBy(payloads, omitByPrefixPredicate('$'), maxDepth) as T
  }

  static omitMeta<T extends Payload>(payload: T, maxDepth?: number): T
  static omitMeta<T extends Payload>(payloads: T[], maxDepth?: number): T[]
  static omitMeta<T extends Payload>(payloads: T | T[], maxDepth = 100): T | T[] {
    return Array.isArray(payloads)
      ? this.omitStorageMeta(this.omitClientMeta(payloads, maxDepth), maxDepth)
      : this.omitStorageMeta(this.omitClientMeta(payloads, maxDepth), maxDepth)
  }

  static omitStorageMeta<T extends Payload>(payload: T, maxDepth?: number): T
  static omitStorageMeta<T extends Payload>(payloads: T[], maxDepth?: number): T[]
  static omitStorageMeta<T extends Payload>(payloads: T | T[], maxDepth = 100): T | T[] {
    return Array.isArray(payloads)
      ? payloads.map(payload => this.omitStorageMeta(payload, maxDepth)) as T[]
      : omitBy(payloads, omitByPrefixPredicate('_'), maxDepth) as T
  }

  async dataHashableFields() {
    return await PayloadBuilderBase.dataHashableFields(
      assertEx(this._schema, () => 'Payload: Missing Schema'),
      // TDOD: Add verification that required fields are present
      this._fields as T,
    )
  }

  fields(fields: WithOptionalSchema<T>) {
    if (fields) {
      const fieldsClone = structuredClone(fields)
      const { schema } = fieldsClone
      if (schema) {
        this.schema(schema)
      }
      this._fields = removeEmptyFields(removeMetaAndSchema<T>(fieldsClone))
    }
    return this
  }

  schema(value: Schema) {
    this._schema = value
  }
}
