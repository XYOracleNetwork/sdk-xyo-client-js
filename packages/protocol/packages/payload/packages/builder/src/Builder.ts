import { assertEx } from '@xylabs/assert'
import { Hash } from '@xylabs/hex'
import { AnyObject, JsonObject } from '@xylabs/object'
import { deepOmitPrefixedFields, PayloadHasher, removeEmptyFields } from '@xyo-network/hash'
import { Payload, PayloadWithMeta, WithMeta } from '@xyo-network/payload-model'

export interface PayloadBuilderOptions<T> {
  fields?: Partial<T>
  meta?: JsonObject
  schema: string
}

export class PayloadBuilder<T extends Payload = Payload<AnyObject>> {
  private _$meta?: JsonObject
  private _fields: Partial<T> = {}
  private _schema: string

  constructor({ schema, fields, meta }: PayloadBuilderOptions<T>) {
    this._schema = schema
    this._fields = fields ?? {}
    this._$meta = meta
  }

  get schema() {
    this._schema = this._schema ?? this._fields['schema']
    return this._schema
  }

  static async build<T extends Payload>(payload: T) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { schema, $hash, $meta, ...fields } = payload as WithMeta<T>
    const builder = new PayloadBuilder<T>({ fields: fields as T, meta: $meta, schema: payload.schema })
    return await builder.build()
  }

  static async dataHash<T extends Payload>(payload: T): Promise<Hash> {
    return (await this.build(payload)).$hash
  }

  static async dataHashPairs<T extends Payload>(payloads: T[]): Promise<[WithMeta<T>, Hash][]> {
    return await Promise.all(
      payloads.map(async (payload) => {
        const built = await PayloadBuilder.build(payload)
        return [built, built.$hash]
      }),
    )
  }

  static async dataHashes(payloads: undefined): Promise<undefined>
  static async dataHashes<T extends Payload>(payloads: T[]): Promise<Hash[]>
  static async dataHashes<T extends Payload>(payloads?: T[]): Promise<Hash[] | undefined> {
    return payloads
      ? await Promise.all(
          payloads.map(async (payload) => {
            const built = await PayloadBuilder.build(payload)
            return built.$hash
          }),
        )
      : undefined
  }

  static async filterExclude<T extends Payload>(payloads: T[] = [], hash: Hash[] | Hash): Promise<T[]> {
    return await PayloadHasher.filterExcludeByHash(await this.filterExcludeByDataHash(payloads, hash), hash)
  }

  static async filterExcludeByDataHash<T extends Payload>(payloads: T[] = [], hash: Hash[] | Hash): Promise<T[]> {
    const hashes = Array.isArray(hash) ? hash : [hash]
    return (await this.dataHashPairs(payloads)).filter(([_, objHash]) => !hashes.includes(objHash))?.map((pair) => pair[0])
  }

  static async filterIncludeByDataHash<T extends Payload>(payloads: T[] = [], hash: Hash[] | Hash): Promise<T[]> {
    const hashes = Array.isArray(hash) ? hash : [hash]
    return (await this.dataHashPairs(payloads)).filter(([_, objHash]) => hashes.includes(objHash))?.map((pair) => pair[0])
  }

  static async findByDataHash<T extends Payload>(payloads: T[] = [], hash: Hash): Promise<T | undefined> {
    return (await this.dataHashPairs(payloads)).find(([_, objHash]) => objHash === hash)?.[0]
  }

  static async hash<T extends Payload>(payload: T): Promise<Hash> {
    return await PayloadHasher.hash(payload)
  }

  /**
   * Creates an array of payload/hash tuples based on the payloads passed in
   * @param objs Any array of payloads
   * @returns An array of payload/hash tuples
   */
  static async hashPairs<T extends Payload>(payloads: T[]): Promise<[WithMeta<T>, Hash][]> {
    return await Promise.all(
      payloads.map<Promise<[WithMeta<T>, Hash]>>(async (payload) => {
        const built = await PayloadBuilder.build(payload)
        return [built, await PayloadBuilder.hash(built)]
      }),
    )
  }

  static async hashes(payloads: undefined): Promise<undefined>
  static async hashes<T extends Payload>(payloads: T[]): Promise<Hash[]>
  static async hashes<T extends Payload>(payloads?: T[]): Promise<Hash[] | undefined> {
    return await PayloadHasher.hashes(payloads)
  }

  static async toDataHashMap<T extends Payload>(objs: T[]): Promise<Record<Hash, T>> {
    const result: Record<Hash, T> = {}
    for (const pair of await this.dataHashPairs(objs)) {
      result[pair[1]] = pair[0]
    }
    return result
  }

  /**
   * Creates an object map of payload hashes to payloads based on the payloads passed in
   * @param objs Any array of payloads
   * @returns A map of hashes to payloads
   */
  static async toHashMap<T extends Payload>(objs: T[]): Promise<Record<Hash, T>> {
    const result: Record<Hash, T> = {}
    for (const pair of await this.hashPairs(objs)) {
      result[pair[1]] = pair[0]
    }
    return result
  }

  $meta(meta?: JsonObject) {
    this._$meta = meta
    return this
  }

  async build(): Promise<WithMeta<T>> {
    const dataHashableFields = this.dataHashableFields()
    const $hash = await PayloadBuilder.hash(dataHashableFields)
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
      const { $meta } = fields as Partial<WithMeta<T>>
      if ($meta) {
        this.$meta($meta)
      }
      this._fields = { ...this._fields, ...removeEmptyFields(fields) }
    }
    return this
  }
}
