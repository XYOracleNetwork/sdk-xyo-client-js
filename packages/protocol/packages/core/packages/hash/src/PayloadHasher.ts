import { asHash, Hash, hexFromArrayBuffer } from '@xylabs/hex'
import { subtle } from '@xylabs/platform'
import { EmptyObject, ObjectWrapper } from '@xyo-network/object'
import { WasmSupport } from '@xyo-network/wasm'
import { sha256 } from 'hash-wasm'
import shajs from 'sha.js'

import { removeEmptyFields } from './removeEmptyFields'
import { deepOmitUnderscoreFields } from './removeFields'
import { sortFields } from './sortFields'

const wasmSupportStatic = new WasmSupport(['bigInt'])

export class PayloadHasher<T extends EmptyObject = EmptyObject> extends ObjectWrapper<T> {
  static allowSubtle = true
  static readonly wasmInitialized = wasmSupportStatic.initialize()
  static readonly wasmSupport = wasmSupportStatic

  static async filterExclude<T extends EmptyObject>(objs: T[] = [], hash: Hash[] | Hash): Promise<T[]> {
    const hashes = Array.isArray(hash) ? hash : [hash]
    return (await this.hashPairs(objs)).filter(([_, objHash]) => !hashes.includes(objHash))?.map((pair) => pair[0])
  }

  static async filterInclude<T extends EmptyObject>(objs: T[] = [], hash: Hash[] | Hash): Promise<T[]> {
    const hashes = Array.isArray(hash) ? hash : [hash]
    return (await this.hashPairs(objs)).filter(([_, objHash]) => hashes.includes(objHash))?.map((pair) => pair[0])
  }

  static async find<T extends EmptyObject>(objs: T[] = [], hash: Hash): Promise<T | undefined> {
    return (await this.hashPairs(objs)).find(([_, objHash]) => objHash === hash)?.[0]
  }

  /**
   * Asynchronously hashes a payload
   * @param obj A payload
   * @returns The payload hash
   */
  static async hashAsync<T extends EmptyObject>(obj: T): Promise<Hash> {
    if (PayloadHasher.allowSubtle) {
      try {
        const enc = new TextEncoder()
        const stringToHash = this.stringifyHashFields(obj)
        const b = enc.encode(stringToHash)
        const hashArray = await subtle.digest('SHA-256', b)
        return hexFromArrayBuffer(hashArray, { bitLength: 256 })
      } catch (ex) {
        const error = ex as Error
        console.error(`Setting allowSubtle to false [${error.message}]`)
        console.log(error.stack)
        PayloadHasher.allowSubtle = false
      }
    }

    await this.wasmInitialized
    if (this.wasmSupport.canUseWasm) {
      const stringToHash = this.stringifyHashFields(obj)
      try {
        return asHash(await sha256(stringToHash), true)
      } catch {
        this.wasmSupport.allowWasm = false
      }
    }
    return this.hashSync(obj)
  }

  static hashFields<T extends EmptyObject>(obj: T): T {
    return sortFields(removeEmptyFields(deepOmitUnderscoreFields(obj)))
  }

  /**
   * Creates an array of payload/hash tuples based on the payloads passed in
   * @param objs Any array of payloads
   * @returns An array of payload/hash tuples
   */
  static async hashPairs<T extends EmptyObject>(objs: T[]): Promise<[T, Hash][]> {
    return await Promise.all(objs.map<Promise<[T, string]>>(async (obj) => [obj, await PayloadHasher.hashAsync(obj)]))
  }

  /**
   * Synchronously hashes a payload
   * @param obj A payload
   * @returns The payload hash
   */
  static hashSync<T extends EmptyObject>(obj: T): Hash {
    return asHash(shajs('sha256').update(this.stringifyHashFields(obj)).digest().toString('hex'), true)
  }

  /**
   * Creates an array of payload hashes based on the payloads passed in
   * @param objs Any array of payloads
   * @returns An array of payload hashes
   */
  static async hashes<T extends EmptyObject>(objs: T[]): Promise<Hash[]> {
    return await Promise.all(objs.map((obj) => this.hashAsync(obj)))
  }

  /**
   * Returns a clone of the payload that is JSON safe
   * @param obj A payload
   * @param meta Keeps underscore (meta) fields if set to true
   * @returns Returns a clone of the payload that is JSON safe
   */
  static jsonPayload<T extends EmptyObject>(payload: T, meta = false): T {
    return sortFields(removeEmptyFields(meta ? payload : deepOmitUnderscoreFields(payload)))
  }

  static stringifyHashFields<T extends EmptyObject>(obj: T) {
    return JSON.stringify(this.hashFields(obj))
  }

  /**
   * Creates an object map of payload hashes to payloads based on the payloads passed in
   * @param objs Any array of payloads
   * @returns A map of hashes to payloads
   */
  static async toMap<T extends EmptyObject>(objs: T[]): Promise<Record<Hash, T>> {
    return Object.fromEntries(
      await Promise.all(
        objs.map(async (obj) => {
          return [await PayloadHasher.hashAsync(obj), obj]
        }),
      ),
    )
  }

  async hashAsync(): Promise<Hash> {
    return await PayloadHasher.hashAsync(this.obj)
  }

  hashSync(): Hash {
    return PayloadHasher.hashSync(this.obj)
  }

  /**
   * Returns a clone of the payload that is JSON safe
   * @param meta Keeps underscore (meta) fields if set to true
   * @returns Returns a clone of the payload that is JSON safe
   */
  jsonPayload(meta = false): T {
    return PayloadHasher.jsonPayload(this.obj, meta)
  }
}
