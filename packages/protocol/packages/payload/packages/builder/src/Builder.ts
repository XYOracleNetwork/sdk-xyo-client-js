import { assertEx } from '@xylabs/assert'
import { Hash } from '@xylabs/hex'
import { JsonObject } from '@xylabs/object'
import { deepOmitPrefixedFields, PayloadHasher, removeEmptyFields } from '@xyo-network/hash'
import { Payload, PayloadWithMeta, WithMeta } from '@xyo-network/payload-model'

export interface PayloadBuilderOptions {
  schema: string
}

export class PayloadBuilder<T extends Payload = Payload> {
  private _$meta?: JsonObject
  private _fields: Partial<T> = {}
  private _schema: string

  constructor({ schema }: PayloadBuilderOptions) {
    this._schema = schema
  }

  get schema() {
    this._schema = this._schema ?? this._fields['schema']
    return this._schema
  }

  static async build<T extends Payload>(payload: T) {
    const builder = new PayloadBuilder<T>({ schema: payload.schema })
    builder.fields(payload)
    return await builder.build()
  }

  static async filterExclude<T extends Payload>(payloads: T[] = [], hash: Hash[] | Hash): Promise<T[]> {
    const hashes = Array.isArray(hash) ? hash : [hash]
    return (await this.hashPairs(payloads)).filter(([_, objHash]) => !hashes.includes(objHash))?.map((pair) => pair[0])
  }

  static async filterInclude<T extends Payload>(payloads: T[] = [], hash: Hash[] | Hash): Promise<T[]> {
    const hashes = Array.isArray(hash) ? hash : [hash]
    return (await this.hashPairs(payloads)).filter(([_, objHash]) => hashes.includes(objHash))?.map((pair) => pair[0])
  }

  static async find<T extends Payload>(payloads: T[] = [], hash: Hash): Promise<T | undefined> {
    return (await this.hashPairs(payloads)).find(([_, objHash]) => objHash === hash)?.[0]
  }

  /**
   * Creates an array of payload/hash tuples based on the payloads passed in
   * @param objs Any array of payloads
   * @returns An array of payload/hash tuples
   */
  static async hashPairs<T extends Payload>(payloads: T[]): Promise<[T, Hash][]> {
    return await Promise.all(payloads.map<Promise<[T, string]>>(async (payload) => [payload, (await PayloadBuilder.build(payload)).$hash]))
  }

  /**
   * Creates an object map of payload hashes to payloads based on the payloads passed in
   * @param objs Any array of payloads
   * @returns A map of hashes to payloads
   */
  static async toMap<T extends Payload>(objs: T[]): Promise<Record<Hash, T>> {
    return Object.fromEntries(
      await Promise.all(
        objs.map(async (obj) => {
          const built = await PayloadBuilder.build(obj)
          return [built.$hash, built]
        }),
      ),
    )
  }

  $meta(fields?: JsonObject) {
    this._$meta = fields
    return this
  }

  async build(): Promise<WithMeta<T>> {
    const dataHashableFields = this.dataHashableFields()
    const $hash = await PayloadHasher.hashAsync(dataHashableFields)
    const hashableFields: PayloadWithMeta = { ...dataHashableFields, $hash }

    //only add $meta if it exists and has at least one field
    if (this._$meta && Object.keys(this._$meta).length > 0) {
      hashableFields['$meta'] = this._$meta
    }
    return hashableFields as WithMeta<T>
  }

  dataHashableFields() {
    return {
      ...removeEmptyFields(deepOmitPrefixedFields(deepOmitPrefixedFields(this._fields, '$'), '_')),
      schema: assertEx(this.schema, 'Payload: Missing Schema'),
    } as T
  }

  fields(fields?: Partial<T>) {
    if (fields) {
      this._fields = { ...this._fields, ...removeEmptyFields(fields) }
    }
    return this
  }
}
