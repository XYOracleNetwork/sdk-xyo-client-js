import type { Hash } from '@xylabs/hex'
import type { AnyObject } from '@xylabs/object'
import { ObjectHasher } from '@xyo-network/hash'
import type { Payload } from '@xyo-network/payload-model'

import { PayloadBuilderBase } from './BuilderBase.ts'
import type { PayloadBuilderOptions } from './Options.ts'

export class PayloadBuilder<
  T extends Payload = Payload<AnyObject>,
  O extends PayloadBuilderOptions<T> = PayloadBuilderOptions<T>,
> extends PayloadBuilderBase<T, O> {
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
  ): T {
    return this.omitStorageMeta(payload)
  }

  static async hashes(payloads: undefined): Promise<undefined>
  static async hashes<T extends Payload>(payloads: T[]): Promise<Hash[]>
  static async hashes<T extends Payload>(payloads?: T[]): Promise<Hash[] | undefined> {
    return await ObjectHasher.hashes(payloads)
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
    } as T
  }
}
