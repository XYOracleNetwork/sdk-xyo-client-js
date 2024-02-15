import { Hash } from '@xylabs/hex'
import { AnyObject, JsonObject } from '@xylabs/object'
import { PayloadHasher } from '@xyo-network/hash'
import { Payload, PayloadWithMeta, WithMeta } from '@xyo-network/payload-model'

import { PayloadBuilderBase } from './BuilderBase'
import { PayloadBuilderOptions } from './Options'

export class PayloadBuilder<
  T extends Payload = Payload<AnyObject>,
  O extends PayloadBuilderOptions<T> = PayloadBuilderOptions<T>,
> extends PayloadBuilderBase<T, O> {
  static async build<T extends Payload = Payload<AnyObject>>(payload: T, validate?: boolean): Promise<WithMeta<T>>
  static async build<T extends Payload = Payload<AnyObject>>(payload: T[], validate?: boolean): Promise<WithMeta<T>[]>
  static async build<T extends Payload = Payload<AnyObject>>(payload: T | T[], validate = false) {
    if (Array.isArray(payload)) {
      return await Promise.all(payload.map((payload) => this.build(payload)))
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { schema, $hash: incomingDataHash, $meta, ...fields } = payload as WithMeta<T>
      const dataHashableFields = await PayloadBuilder.dataHashableFields(schema, fields)
      const $hash = validate || incomingDataHash === undefined ? await PayloadBuilder.hash(dataHashableFields) : incomingDataHash
      const hashableFields = { ...dataHashableFields, $hash, $meta: { ...$meta, timestamp: $meta?.timestamp ?? Date.now() } as JsonObject }

      return hashableFields as WithMeta<T>
    }
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

  async build(): Promise<WithMeta<T>> {
    const dataHashableFields = await this.dataHashableFields()
    const $hash = await PayloadBuilder.hash(dataHashableFields)
    const $meta = await this.metaFields($hash)
    const hashableFields: PayloadWithMeta = { ...dataHashableFields, $hash, $meta }

    return hashableFields as WithMeta<T>
  }
}
