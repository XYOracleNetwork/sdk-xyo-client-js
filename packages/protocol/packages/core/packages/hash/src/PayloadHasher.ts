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
      } catch (ex) {
        this.wasmSupport.allowWasm = false
      }
    }
    return this.hashSync(obj)
  }

  static hashFields<T extends EmptyObject>(obj: T): T {
    return sortFields(removeEmptyFields(deepOmitUnderscoreFields(obj)))
  }

  static async hashPairs<T extends EmptyObject>(objs: T[]): Promise<[T, Hash][]> {
    return await Promise.all(objs.map<Promise<[T, string]>>(async (obj) => [obj, await PayloadHasher.hashAsync(obj)]))
  }

  static hashSync<T extends EmptyObject>(obj: T): Hash {
    return asHash(shajs('sha256').update(this.stringifyHashFields(obj)).digest().toString('hex'), true)
  }

  static async hashes<T extends EmptyObject>(objs: T[]): Promise<Hash[]> {
    return await Promise.all(objs.map((obj) => this.hashAsync(obj)))
  }

  /** @function jsonPayload Returns a clone of the payload that is JSON safe */
  static jsonPayload<T extends EmptyObject>(
    /** @param payload The payload to process */
    payload: T,
    /** @param meta Keeps underscore (meta) fields if set to true */
    meta = false,
  ): T {
    return sortFields(removeEmptyFields(meta ? payload : deepOmitUnderscoreFields(payload)))
  }

  static stringifyHashFields<T extends EmptyObject>(obj: T) {
    return JSON.stringify(this.hashFields(obj))
  }

  static async toMap<T extends EmptyObject>(objs: T[]): Promise<Record<Hash, T>> {
    const result: Record<string, T> = {}
    await Promise.all(objs.map(async (obj) => (result[await PayloadHasher.hashAsync(obj)] = obj)))
    return result
  }

  async hashAsync(): Promise<Hash> {
    return await PayloadHasher.hashAsync(this.obj)
  }

  hashSync(): Hash {
    return PayloadHasher.hashSync(this.obj)
  }

  /** @function jsonPayload Returns a clone of the payload that is JSON safe */
  jsonPayload(
    /** @param meta Keeps underscore (meta) fields if set to true */
    meta = false,
  ): T {
    return PayloadHasher.jsonPayload(this.obj, meta)
  }
}
