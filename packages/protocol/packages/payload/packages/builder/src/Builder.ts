import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import type { Hash } from '@xylabs/hex'
import type {
  AnyObject, Compare, EmptyObject,
} from '@xylabs/object'
import {
  isJsonObject, omitByPrefix, pickByPrefix, toJson,
} from '@xylabs/object'
import type { Promisable } from '@xylabs/promise'
import { ObjectHasher, removeEmptyFields } from '@xyo-network/hash'
import type {
  Payload, Schema,
  Sequence,
  WithHashStorageMeta,
  WithOnlyClientMeta,
  WithOptionalSchema,
  WithoutClientMeta,
  WithoutMeta,
  WithoutPrivateStorageMeta,
  WithoutSchema,
  WithoutStorageMeta,
  WithStorageMeta,
} from '@xyo-network/payload-model'
import {
  SequenceComparer,
  SequenceParser,
} from '@xyo-network/payload-model'

import type { PayloadBuilderOptions } from './Options.ts'

export const omitSchema = <T extends WithOptionalSchema>(payload: T): WithoutSchema<T> => {
  const result = structuredClone(payload)
  delete result.schema
  return result
}

export class PayloadBuilder<T extends Payload = Payload<AnyObject>, R = T> {
  protected _fields?: WithoutStorageMeta<WithoutClientMeta<WithoutSchema<T>>>
  protected _meta?: WithOnlyClientMeta<T>
  protected _schema: Schema

  constructor(readonly options: PayloadBuilderOptions) {
    const { schema } = options
    this._schema = schema
  }

  static async addStorageMeta<T extends Payload>(payload: T, index?: number): Promise<WithStorageMeta<T>>
  static async addStorageMeta<T extends Payload>(payloads: T[]): Promise<WithStorageMeta<T>[]>
  static async addStorageMeta<T extends Payload>(payloads: T | T[], index = 0): Promise<WithStorageMeta<T>[] | WithStorageMeta<T>> {
    return Array.isArray(payloads)
      ? await (async () => {
        const timestamp = Date.now()
        return (await Promise.all(payloads.map(async (payload, i) => await this.addSequencedStorageMeta(
          payload,
          timestamp,
          i,
        )))).sort(this.compareStorageMeta)
      })()
      : this.addSequencedStorageMeta(
          payloads,
          index,
        )
  }

  static compareStorageMeta(
    a: WithStorageMeta<Payload>,
    b: WithStorageMeta<Payload>,
    comparer: Compare<Sequence> = SequenceComparer.local,
  ) {
    return comparer(a._sequence, b._sequence)
  }

  static async dataHash<T extends Payload>(payload: T): Promise<Hash> {
    return await ObjectHasher.hash(this.omitMeta(payload))
  }

  static async dataHashPairs<T extends Payload>(payloads: T[]): Promise<[T, Hash][]> {
    return await Promise.all(
      payloads.map(async (payload) => {
        const dataHash = await this.dataHash(payload)
        return [payload, dataHash]
      }),
    )
  }

  static dataHashableFields<T extends Payload>(
    schema: Schema,
    payload: WithoutSchema<T>,

  ): Promisable<WithoutMeta<T>> {
    const cleanFields = removeEmptyFields({ ...payload, schema })
    assertEx(
      cleanFields == undefined || isJsonObject(cleanFields),
      () => `Fields must be JsonObject: ${JSON.stringify(toJson(cleanFields), null, 2)}`,
    )
    return this.omitMeta(cleanFields) as WithoutMeta<T>
  }

  static async dataHashes(payloads: undefined): Promise<undefined>
  static async dataHashes<T extends Payload>(payloads: T[]): Promise<Hash[]>
  static async dataHashes<T extends Payload>(payloads?: T[]): Promise<Hash[] | undefined> {
    return payloads
      ? await Promise.all(
        payloads.map(async (payload) => {
          return await this.dataHash(payload)
        }),
      )
      : undefined
  }

  static async filterExclude<T extends Payload>(payloads: T[] = [], hash: Hash[] | Hash): Promise<T[]> {
    return await ObjectHasher.filterExcludeByHash(await this.filterExcludeByDataHash(payloads, hash), hash)
  }

  static async filterExcludeByDataHash<T extends Payload>(payloads: T[] = [], hash: Hash[] | Hash): Promise<T[]> {
    const hashes = Array.isArray(hash) ? hash : [hash]
    return (await this.dataHashPairs(payloads)).filter(([_, objHash]) => !hashes.includes(objHash))?.map(pair => pair[0])
  }

  static async filterIncludeByDataHash<T extends Payload>(payloads: T[] = [], hash: Hash[] | Hash): Promise<T[]> {
    const hashes = Array.isArray(hash) ? hash : [hash]
    return (await this.dataHashPairs(payloads)).filter(([_, objHash]) => hashes.includes(objHash))?.map(pair => pair[0])
  }

  static async filterIncludeByEitherHash<T extends Payload>(payloads: T[] = [], hash: Hash[] | Hash): Promise<T[]> {
    const hashes = Array.isArray(hash) ? hash : [hash]
    const map = await PayloadBuilder.toAllHashMap(payloads)
    return hashes.map(hash => map[hash]).filter(exists)
  }

  static async findByDataHash<T extends Payload>(payloads: T[] = [], hash: Hash): Promise<T | undefined> {
    return (await this.dataHashPairs(payloads)).find(([_, objHash]) => objHash === hash)?.[0]
  }

  static async hash<T extends Payload>(payload: T): Promise<Hash> {
    return await ObjectHasher.hash(this.omitStorageMeta(payload))
  }

  /**
   * Creates an array of payload/hash tuples based on the payloads passed in
   * @param objs Any array of payloads
   * @returns An array of payload/hash tuples
   */
  static async hashPairs<T extends Payload>(payloads: T[]): Promise<[T, Hash][]> {
    return await Promise.all(
      payloads.map<Promise<[T, Hash]>>(async (payload) => {
        return [payload, await this.hash(payload)]
      }),
    )
  }

  static hashableFields<T extends Payload>(
    payload: T,
  ): WithoutStorageMeta<T> {
    return this.omitStorageMeta(payload)
  }

  static async hashes(payloads: undefined): Promise<undefined>
  static async hashes<T extends Payload>(payloads: T[]): Promise<Hash[]>
  static async hashes<T extends Payload>(payloads?: T[]): Promise<Hash[] | undefined> {
    return await ObjectHasher.hashes(payloads)
  }

  static omitClientMeta<T extends EmptyObject>(payload: T, maxDepth?: number): WithoutClientMeta<T>
  static omitClientMeta<T extends EmptyObject>(payloads: T[], maxDepth?: number): WithoutClientMeta<T>[]
  static omitClientMeta<T extends EmptyObject>(payloads: T | T[], maxDepth = 1): WithoutClientMeta<T> | WithoutClientMeta<T>[] {
    return Array.isArray(payloads)
      ? payloads.map(payload => this.omitClientMeta(payload, maxDepth))
      : omitByPrefix(payloads, '$', maxDepth)
  }

  static omitMeta<T extends EmptyObject>(payload: T, maxDepth?: number): WithoutMeta<T>
  static omitMeta<T extends EmptyObject>(payloads: T[], maxDepth?: number): WithoutMeta<T>[]
  static omitMeta<T extends EmptyObject>(payloads: T | T[], maxDepth = 1): WithoutMeta<T> | WithoutMeta<T>[] {
    return Array.isArray(payloads)
      ? payloads.map(payload => this.omitMeta(payload, maxDepth))
      : this.omitStorageMeta(this.omitClientMeta(payloads, maxDepth), maxDepth) as unknown as WithoutMeta<T>
  }

  static omitPrivateStorageMeta<T extends EmptyObject>(payload: T, maxDepth?: number): WithoutPrivateStorageMeta<T>
  static omitPrivateStorageMeta<T extends EmptyObject>(payloads: T[], maxDepth?: number): WithoutPrivateStorageMeta<T>[]
  static omitPrivateStorageMeta<T extends EmptyObject>(payloads: T | T[], maxDepth = 1): WithoutPrivateStorageMeta<T> | WithoutPrivateStorageMeta<T>[] {
    return Array.isArray(payloads)
      ? payloads.map(payload => this.omitPrivateStorageMeta(payload, maxDepth))
      : omitByPrefix(payloads, '__', maxDepth)
  }

  static omitStorageMeta<T extends EmptyObject>(payload: T, maxDepth?: number): WithoutStorageMeta<T>
  static omitStorageMeta<T extends EmptyObject>(payloads: T[], maxDepth?: number): WithoutStorageMeta<T>[]
  static omitStorageMeta<T extends EmptyObject>(payloads: T | T[], maxDepth = 1): WithoutStorageMeta<T> | WithoutStorageMeta<T>[] {
    return Array.isArray(payloads)
      ? payloads.map(payload => this.omitStorageMeta(payload, maxDepth))
      : omitByPrefix(payloads, '_', maxDepth)
  }

  static pickClientMeta<T extends EmptyObject>(payload: T, maxDepth?: number): WithOnlyClientMeta<T>
  static pickClientMeta<T extends EmptyObject>(payloads: T[], maxDepth?: number): WithOnlyClientMeta<T>[]
  static pickClientMeta<T extends EmptyObject>(payloads: T | T[], maxDepth = 1): WithOnlyClientMeta<T> | WithOnlyClientMeta<T>[] {
    return Array.isArray(payloads)
      ? payloads.map(payload => this.pickClientMeta(payload, maxDepth))
      : pickByPrefix(payloads, '$', maxDepth)
  }

  static sortByStorageMeta<T extends Payload>(
    payloads: WithStorageMeta<T>[],
    direction: -1 | 1 = 1,
    comparer: Compare<Sequence> = SequenceComparer.local,
  ) {
    return payloads.sort((a, b) => direction * comparer(a._sequence, b._sequence))
  }

  static async toAllHashMap<T extends Payload>(payloads: T[]): Promise<Record<Hash, T>> {
    const result: Record<Hash, T> = {}
    for (const pair of await this.hashPairs(payloads)) {
      const dataHash = await this.dataHash(pair[0])
      result[pair[1]] = pair[0]
      result[dataHash] = pair[0]
    }
    return result
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

  private static async addHashMeta<T extends Payload>(payload: T): Promise<WithHashStorageMeta<T>>
  private static async addHashMeta<T extends Payload>(payloads: T[]): Promise<WithHashStorageMeta<T>[]>
  private static async addHashMeta<T extends Payload>(payloads: T | T[]): Promise<WithHashStorageMeta<T>[] | WithHashStorageMeta<T>> {
    if (Array.isArray(payloads)) {
      return await Promise.all(
        payloads.map(async (payload) => {
          return await this.addHashMeta(payload)
        }),
      )
    } else {
      const _hash = await this.hash(payloads)
      const _dataHash = await this.dataHash(payloads)
      return {
        ...payloads,
        _dataHash,
        _hash,
      }
    }
  }

  private static async addSequencedStorageMeta<T extends Payload = Payload>(payload: T, timestamp: number, index = 0): Promise<WithStorageMeta<T>> {
    const withHashMeta = await this.addHashMeta(payload)
    const _sequence = SequenceParser.from(timestamp, withHashMeta._hash, index).localSequence
    return {
      ...withHashMeta,
      _sequence,
    }
  }

  build(): R {
    return {
      schema: this._schema,
      ...this._fields,
      ...this._meta,
    } as R
  }

  async dataHashableFields() {
    return await PayloadBuilder.dataHashableFields(
      assertEx(this._schema, () => 'Payload: Missing Schema'),
      // TODO: Add verification that required fields are present
      this._fields as WithoutSchema<T>,
    )
  }

  fields(fields: WithoutStorageMeta<WithoutClientMeta<WithoutSchema<T>>>) {
    // we need to do the cast here since ts seems to not like nested, yet same, generics
    this._fields = PayloadBuilder.omitClientMeta(
      PayloadBuilder.omitStorageMeta(
        omitSchema(
          removeEmptyFields(structuredClone(fields)),
        ),
      ),
    ) as unknown as WithoutStorageMeta<WithoutClientMeta<WithoutSchema<T>>>
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
