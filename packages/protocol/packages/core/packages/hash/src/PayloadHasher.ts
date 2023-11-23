import { asHash, Hash } from '@xylabs/hex'
import { subtle } from '@xylabs/platform'
import { AnyObject, ObjectWrapper } from '@xyo-network/object'
import { WasmSupport } from '@xyo-network/wasm'
import { sha256 } from 'hash-wasm'
import shajs from 'sha.js'

import { removeEmptyFields } from './removeEmptyFields'
import { deepOmitUnderscoreFields } from './removeFields'
import { sortFields } from './sortFields'
import { toUint8Array } from './toUint8Array'

const wasmSupportStatic = new WasmSupport(['bigInt'])

export class PayloadHasher<T extends AnyObject = AnyObject> extends ObjectWrapper<T> {
  static allowSubtle = true
  static readonly wasmInitialized = wasmSupportStatic.initialize()
  static readonly wasmSupport = wasmSupportStatic

  static async filterExclude<T extends AnyObject>(objs: T[] = [], hash: Hash[] | Hash): Promise<T[]> {
    const hashes = Array.isArray(hash) ? hash : [hash]
    return (await this.hashPairs(objs)).filter(([_, objHash]) => !hashes.includes(objHash))?.map((pair) => pair[0])
  }

  static async filterInclude<T extends AnyObject>(objs: T[] = [], hash: Hash[] | Hash): Promise<T[]> {
    const hashes = Array.isArray(hash) ? hash : [hash]
    return (await this.hashPairs(objs)).filter(([_, objHash]) => hashes.includes(objHash))?.map((pair) => pair[0])
  }

  static async find<T extends AnyObject>(objs: T[] = [], hash: Hash): Promise<T | undefined> {
    return (await this.hashPairs(objs)).find(([_, objHash]) => objHash === hash)?.[0]
  }

  static async hashAsync<T extends AnyObject>(obj: T, encoding?: undefined): Promise<Hash>
  static async hashAsync<T extends AnyObject>(obj: T, encoding: 'buffer'): Promise<ArrayBuffer>
  static async hashAsync<T extends AnyObject>(obj: T, encoding: 'hex'): Promise<Hash>
  static async hashAsync<T extends AnyObject>(obj: T, encoding?: 'buffer' | 'hex'): Promise<Hash | ArrayBuffer> {
    if (PayloadHasher.allowSubtle) {
      try {
        const enc = new TextEncoder()
        const stringToHash = this.stringifyHashFields(obj)
        const b = enc.encode(stringToHash)
        const hashArray = await subtle.digest('SHA-256', b)
        return encoding === 'buffer' ? hashArray : asHash(hashArray, 256, true)
      } catch (ex) {
        console.log('Setting allowSubtle to false')
        PayloadHasher.allowSubtle = false
      }
    }

    await this.wasmInitialized
    if (this.wasmSupport.canUseWasm) {
      const stringToHash = this.stringifyHashFields(obj)
      try {
        const hash = asHash(await sha256(stringToHash), 256, true)
        return encoding === 'buffer' ? toUint8Array(hash) : hash
      } catch (ex) {
        this.wasmSupport.allowWasm = false
      }
    }
    return this.hashSync(obj)
  }

  static hashFields<T extends AnyObject>(obj: T): T {
    return sortFields(removeEmptyFields(deepOmitUnderscoreFields(obj)))
  }

  static async hashPairs<T extends AnyObject>(objs: T[]): Promise<[T, Hash][]> {
    return await Promise.all(objs.map<Promise<[T, string]>>(async (obj) => [obj, await PayloadHasher.hashAsync(obj, 'hex')]))
  }

  /** @deprecated pass encoding [hex,buffer] */
  static hashSync<T extends AnyObject>(obj: T, encoding?: undefined): Hash
  static hashSync<T extends AnyObject>(obj: T, encoding: 'buffer'): ArrayBuffer
  static hashSync<T extends AnyObject>(obj: T, encoding: 'hex'): Hash
  static hashSync<T extends AnyObject>(obj: T, encoding?: 'buffer' | 'hex'): Hash | ArrayBuffer {
    const buffer = shajs('sha256').update(this.stringifyHashFields(obj)).digest()
    switch (encoding) {
      case 'buffer':
        return buffer.buffer
      default:
        return asHash(buffer.toString('hex'), 256, true)
    }
  }

  static async hashes<T extends AnyObject>(objs: T[]): Promise<Hash[]> {
    return await Promise.all(objs.map((obj) => this.hashAsync(obj, 'hex')))
  }

  /** @function jsonPayload Returns a clone of the payload that is JSON safe */
  static jsonPayload<T extends AnyObject>(
    /** @param payload The payload to process */
    payload: T,
    /** @param meta Keeps underscore (meta) fields if set to true */
    meta = false,
  ): T {
    return sortFields(removeEmptyFields(meta ? payload : deepOmitUnderscoreFields(payload)))
  }

  static stringifyHashFields<T extends AnyObject>(obj: T) {
    return JSON.stringify(this.hashFields(obj))
  }

  static async toMap<T extends AnyObject>(objs: T[]): Promise<Record<Hash, T>> {
    const result: Record<string, T> = {}
    await Promise.all(objs.map(async (obj) => (result[await PayloadHasher.hashAsync(obj, 'hex')] = obj)))
    return result
  }

  /** @deprecated pass encoding [hex,buffer] */
  async hashAsync(encoding?: undefined): Promise<Hash>
  async hashAsync(encoding: 'buffer'): Promise<ArrayBuffer>
  async hashAsync(encoding: 'hex'): Promise<Hash>
  async hashAsync(encoding?: 'buffer' | 'hex'): Promise<Hash | ArrayBuffer> {
    switch (encoding) {
      case 'buffer':
        return await PayloadHasher.hashAsync(this.obj, encoding)
      case 'hex':
        return await PayloadHasher.hashAsync(this.obj, encoding)
      default:
        return await PayloadHasher.hashAsync(this.obj, encoding)
    }
  }

  /** @deprecated pass encoding [hex,buffer] */
  hashSync(encoding?: undefined): Hash
  hashSync(encoding: 'buffer'): ArrayBuffer
  hashSync(encoding: 'hex'): Hash
  hashSync(encoding?: 'hex' | 'buffer'): Hash | ArrayBuffer {
    switch (encoding) {
      case 'hex':
        return PayloadHasher.hashSync(this.obj, encoding)
      case 'buffer':
        return PayloadHasher.hashSync(this.obj, encoding)
      default:
        return PayloadHasher.hashSync(this.obj, encoding)
    }
  }

  /** @function jsonPayload Returns a clone of the payload that is JSON safe */
  jsonPayload(
    /** @param meta Keeps underscore (meta) fields if set to true */
    meta = false,
  ): T {
    return PayloadHasher.jsonPayload(this.obj, meta)
  }
}
