import { assertEx } from '@xylabs/assert'
import type { AnyObject } from '@xylabs/object'
import {
  isJsonObject, omitBy, toJson,
} from '@xylabs/object'
import type { Promisable } from '@xylabs/promise'
import { removeEmptyFields } from '@xyo-network/hash'
import type { Payload, Schema } from '@xyo-network/payload-model'

import type { PayloadBuilderOptions } from './Options.ts'

export type WithOptionalSchema<T extends Payload> = Omit<T, 'schema'> & Partial<T>

export type WithoutSchema<T extends WithOptionalSchema<Payload>> = Omit<T, 'schema'>

export const removeMetaAndSchema = <T extends Payload>(payload: Partial<WithOptionalSchema<T>>): WithoutSchema<T> => {
  const { ...result } = payload
  delete result.schema
  return result as Omit<T, 'schema'>
}

const omitByPredicate = (prefix: string) => (_: unknown, key: string) => {
  assertEx(typeof key === 'string', () => `Invalid key type [${key}, ${typeof key}]`)
  return key.startsWith(prefix)
}

export class PayloadBuilderBase<T extends Payload = Payload<AnyObject>, O extends PayloadBuilderOptions<T> = PayloadBuilderOptions<T>> {
  protected _fields?: Partial<WithoutSchema<T>>
  protected _schema: Schema

  constructor(readonly options: O) {
    const { schema, fields } = options
    this._schema = schema
    this._fields = removeMetaAndSchema(removeEmptyFields(fields ?? {}))
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
    return omitBy(omitBy(cleanFields as object, omitByPredicate('$')), omitByPredicate('_')) as T
  }

  static omitClientMeta<T extends Payload>(payload: T): T {
    return omitBy(payload, omitByPredicate('$')) as T
  }

  static omitMeta<T extends Payload>(payload: T): T {
    return this.omitStorageMeta(this.omitClientMeta(payload))
  }

  static omitStorageMeta<T extends Payload>(payload: T, maxDepth = 100): T {
    return omitBy(payload, omitByPredicate('_'), maxDepth) as T
  }

  async dataHashableFields() {
    return await PayloadBuilderBase.dataHashableFields(
      assertEx(this._schema, () => 'Payload: Missing Schema'),
      // TDOD: Add verification that required fields are present
      this._fields as T,
    )
  }

  // we do not require sending in $hash since it will be generated anyway
  fields(fields: WithOptionalSchema<T>) {
    if (fields) {
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        schema, ...fieldsOnly
      } = fields
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
}
