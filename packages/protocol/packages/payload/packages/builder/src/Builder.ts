import { assertEx } from '@xylabs/assert'
import { Hash } from '@xylabs/hex'
import { omitBy } from '@xylabs/lodash'
import { AnyObject, isJsonObject, JsonArray, JsonObject } from '@xylabs/object'
import { PayloadHasher } from '@xyo-network/hash'
import { Payload, PayloadWithMeta, WithMeta } from '@xyo-network/payload-model'

import { PayloadBuilderBase, removeMetaAndSchema, WithoutMeta, WithoutSchema } from './BuilderBase.js'
import { PayloadBuilderOptions } from './Options.js'

export interface BuildOptions {
  stamp?: boolean
  validate?: boolean
}

const omitByPredicate = (prefix: string) => (_: unknown, key: string) => {
  assertEx(typeof key === 'string', () => `Invalid key type [${key}, ${typeof key}]`)
  return key.startsWith(prefix)
}

export class PayloadBuilder<
  T extends Payload = Payload<AnyObject>,
  O extends PayloadBuilderOptions<T> = PayloadBuilderOptions<T>,
> extends PayloadBuilderBase<T, O> {
  static async build<T extends Payload = Payload<AnyObject>>(payload: T, options?: BuildOptions): Promise<WithMeta<T>>
  static async build<T extends Payload = Payload<AnyObject>>(payload: T[], options?: BuildOptions): Promise<WithMeta<T>[]>
  static async build<T extends Payload = Payload<AnyObject>>(payload: T | T[], options: BuildOptions = {}) {
    if (Array.isArray(payload)) {
      return await Promise.all(payload.map((payload) => this.build(payload, options)))
    } else {
      const { stamp = false, validate = true } = options
      const { schema, $hash: incomingDataHash, $meta: incomingMeta = {} } = payload as WithMeta<T>

      //check for legacy signatures
      const { _signatures } = payload as { _signatures?: JsonArray }
      if (_signatures && !incomingMeta.signatures) {
        incomingMeta.signatures = _signatures
      }

      const fields = removeMetaAndSchema(payload)
      const dataHashableFields = await PayloadBuilder.dataHashableFields(schema, fields)
      const $hash = validate || incomingDataHash === undefined ? await PayloadHasher.hash(dataHashableFields) : incomingDataHash
      const $meta: JsonObject = { ...incomingMeta }
      if ($meta.timestamp === undefined && stamp) {
        $meta.timestamp = Date.now()
      }
      const hashableFields: WithMeta<Payload> = { ...dataHashableFields, $hash, schema }

      if (Object.keys($meta).length > 0) {
        hashableFields.$meta = $meta
      }

      return hashableFields as WithMeta<T>
    }
  }

  static async dataHash<T extends Payload>(payload: T, options?: BuildOptions): Promise<Hash> {
    return (await this.build(payload, options)).$hash
  }

  static async dataHashPairs<T extends Payload>(payloads: T[], options?: BuildOptions): Promise<[WithMeta<T>, Hash][]> {
    return await Promise.all(
      payloads.map(async (payload) => {
        const built = await PayloadBuilder.build(payload, options)
        return [built, built.$hash]
      }),
    )
  }

  static async dataHashes(payloads: undefined, options?: BuildOptions): Promise<undefined>
  static async dataHashes<T extends Payload>(payloads: T[], options?: BuildOptions): Promise<Hash[]>
  static async dataHashes<T extends Payload>(payloads?: T[], options?: BuildOptions): Promise<Hash[] | undefined> {
    return payloads ?
        await Promise.all(
          payloads.map(async (payload) => {
            const built = await PayloadBuilder.build(payload, options)
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

  static async hash<T extends Payload>(payload: T, options?: BuildOptions): Promise<Hash> {
    return await PayloadHasher.hash(await PayloadBuilder.build(payload, options))
  }

  /**
   * Creates an array of payload/hash tuples based on the payloads passed in
   * @param objs Any array of payloads
   * @returns An array of payload/hash tuples
   */
  static async hashPairs<T extends Payload>(payloads: T[], options?: BuildOptions): Promise<[WithMeta<T>, Hash][]> {
    return await Promise.all(
      payloads.map<Promise<[WithMeta<T>, Hash]>>(async (payload) => {
        const built = await PayloadBuilder.build(payload, options)
        return [built, await PayloadBuilder.hash(built)]
      }),
    )
  }

  static async hashableFields<T extends Payload = Payload<AnyObject>>(
    schema: string,
    fields?: WithoutSchema<WithoutMeta<T>>,
    $meta?: JsonObject,
    $hash?: Hash,
    timestamp?: number,
    stamp = false,
  ): Promise<WithMeta<T>> {
    const dataFields = await this.dataHashableFields<T>(schema, fields)
    assertEx($meta === undefined || isJsonObject($meta), () => '$meta must be JsonObject')
    const result: WithMeta<T> = omitBy(
      {
        ...dataFields,
        $hash: $hash ?? (await PayloadBuilder.dataHash(dataFields)),
        schema,
      } as WithMeta<T>,
      omitByPredicate('_'),
    ) as WithMeta<T>

    const clonedMeta = { ...$meta }

    if (timestamp) {
      clonedMeta.timestamp = timestamp
    }

    if (clonedMeta.timestamp === undefined && stamp) {
      clonedMeta.timestamp = Date.now()
    }

    if (Object.keys(clonedMeta).length > 0) {
      result.$meta = clonedMeta
    }

    return result
  }

  static async hashes(payloads: undefined): Promise<undefined>
  static async hashes<T extends Payload>(payloads: T[]): Promise<Hash[]>
  static async hashes<T extends Payload>(payloads?: T[]): Promise<Hash[] | undefined> {
    return await PayloadHasher.hashes(payloads)
  }

  static async toAllHashMap<T extends Payload>(objs: T[]): Promise<Record<Hash, WithMeta<T>>> {
    const result: Record<Hash, WithMeta<T>> = {}
    for (const pair of await this.hashPairs(objs)) {
      result[pair[1]] = pair[0]
      result[pair[0].$hash] = pair[0]
    }
    return result
  }

  static async toDataHashMap<T extends Payload>(objs: T[]): Promise<Record<Hash, WithMeta<T>>> {
    const result: Record<Hash, WithMeta<T>> = {}
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
  static async toHashMap<T extends Payload>(objs: T[]): Promise<Record<Hash, WithMeta<T>>> {
    const result: Record<Hash, WithMeta<T>> = {}
    for (const pair of await this.hashPairs(objs)) {
      result[pair[1]] = pair[0]
    }
    return result
  }

  static withoutMeta(payload: undefined): undefined
  static withoutMeta<T extends PayloadWithMeta>(payload: T): Omit<T, '$meta'>
  static withoutMeta<T extends PayloadWithMeta>(payloads: T[]): Omit<T, '$meta'>[]
  static withoutMeta<T extends PayloadWithMeta>(payloads: T | T[]) {
    if (Array.isArray(payloads)) {
      return payloads.map((payload) => this.withoutMeta(payload))
    } else {
      if (payloads) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { $meta, ...result } = payloads
        return result as Omit<T, '$meta'>
      }
    }
  }

  async build(options?: BuildOptions): Promise<WithMeta<T>> {
    const dataHashableFields = await this.dataHashableFields()
    return await PayloadBuilder.build<T>({ ...dataHashableFields, $meta: this._$meta, schema: this._schema } as Payload as T, options)
  }

  async hashableFields() {
    return await PayloadBuilder.hashableFields(
      assertEx(this._schema, () => 'Payload: Missing Schema'),
      this._fields,
      this._$meta,
    )
  }
}
