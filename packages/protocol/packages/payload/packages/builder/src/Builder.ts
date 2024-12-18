import type { Hash } from '@xylabs/hex'
import type { AnyObject } from '@xylabs/object'
import { ObjectHasher } from '@xyo-network/hash'
import {
  type Payload,
  SequenceParser,
  type WithHashMeta,
  type WithoutStorageMeta,
  type WithStorageMeta,
} from '@xyo-network/payload-model'

import { PayloadBuilderBase } from './BuilderBase.ts'

export class PayloadBuilder<
  T extends Payload = Payload<AnyObject>,
> extends PayloadBuilderBase<T> {
  static async addHashMeta<T extends Payload>(payload: T): Promise<WithHashMeta<T>>
  static async addHashMeta<T extends Payload>(payloads: T[]): Promise<WithHashMeta<T>[]>
  static async addHashMeta<T extends Payload>(payloads: T | T[]): Promise<WithHashMeta<T>[] | WithHashMeta<T>> {
    if (Array.isArray(payloads)) {
      return await Promise.all(
        payloads.map(async (payload) => {
          return await this.addHashMeta(payload)
        }),
      )
    } else {
      const _hash = await PayloadBuilder.hash(payloads)
      const _dataHash = await PayloadBuilder.dataHash(payloads)
      return {
        ...payloads,
        _dataHash,
        _hash,
      }
    }
  }

  static async addSequencedStorageMeta<T extends Payload = Payload>(payload: T): Promise<WithStorageMeta<T>> {
    const withHashMeta = await this.addHashMeta(payload)
    const _sequence = SequenceParser.from(Date.now(), withHashMeta._hash).localSequence
    return {
      ...withHashMeta,
      _sequence,
    }
  }

  static async addStorageMeta<T extends Payload>(payload: T): Promise<WithStorageMeta<T>>
  static async addStorageMeta<T extends Payload>(payloads: T[]): Promise<WithStorageMeta<T>[]>
  static async addStorageMeta<T extends Payload>(payloads: T | T[]): Promise<WithStorageMeta<T>[] | WithStorageMeta<T>> {
    return Array.isArray(payloads)
      ? await (async () => {
        return await Promise.all(payloads.map(async payload => await this.addSequencedStorageMeta(
          payload,
        )))
      })()
      : this.addSequencedStorageMeta(
          payloads,
        )
  }

  static compareStorageMeta(a: WithStorageMeta<Payload>, b: WithStorageMeta<Payload>) {
    return a._sequence > b._sequence ? 1 : a._sequence < b._sequence ? -1 : 0
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

  static async dataHashes(payloads: undefined): Promise<undefined>
  static async dataHashes<T extends Payload>(payloads: T[]): Promise<Hash[]>
  static async dataHashes<T extends Payload>(payloads?: T[]): Promise<Hash[] | undefined> {
    return payloads
      ? await Promise.all(
        payloads.map(async (payload) => {
          return await PayloadBuilder.dataHash(payload)
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
        return [payload, await PayloadBuilder.hash(payload)]
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

  static sortByStorageMeta<T extends Payload>(payloads: WithStorageMeta<T>[], direction: -1 | 1 = 1) {
    return payloads.sort((a, b) =>
      a._sequence < b._sequence
        ? -direction
        : a._sequence > b._sequence
          ? direction
          : 0)
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

  build(): T {
    return {
      schema: this._schema,
      ...this._fields,
      ...this._meta,
    } as T
  }
}
