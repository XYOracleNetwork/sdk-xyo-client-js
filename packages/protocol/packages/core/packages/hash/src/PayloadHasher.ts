import { base16 } from '@scure/base'
import { Buffer } from '@xylabs/buffer'
import { subtle } from '@xylabs/platform'
import { AnyObject, ObjectWrapper } from '@xyo-network/object'
import { WasmSupport } from '@xyo-network/wasm'
import { sha256 } from 'hash-wasm'
import shajs from 'sha.js'

import { Hash } from './model'
import { removeEmptyFields } from './removeEmptyFields'
import { deepOmitUnderscoreFields } from './removeFields'
import { sortFields } from './sortFields'

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

  static async hashAsync<T extends AnyObject>(obj: T): Promise<Hash> {
    if (PayloadHasher.allowSubtle) {
      try {
        const enc = new TextEncoder()
        const stringToHash = this.stringifyHashFields(obj)
        const b = enc.encode(stringToHash)
        const hashArray = await subtle.digest('SHA-256', b)
        return base16.encode(Buffer.from(hashArray)).toLowerCase()
      } catch (ex) {
        console.log('Setting allowSubtle to false')
        PayloadHasher.allowSubtle = false
      }
    }

    await this.wasmInitialized
    if (this.wasmSupport.canUseWasm) {
      const stringToHash = this.stringifyHashFields(obj)
      try {
        return await sha256(stringToHash)
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
    return await Promise.all(objs.map<Promise<[T, string]>>(async (obj) => [obj, await PayloadHasher.hashAsync(obj)]))
  }

  static hashSync<T extends AnyObject>(obj: T): Hash {
    return shajs('sha256').update(this.stringifyHashFields(obj)).digest().toString('hex')
  }

  static async hashes<T extends AnyObject>(objs: T[]): Promise<Hash[]> {
    return await Promise.all(objs.map((obj) => this.hashAsync(obj)))
  }

  static stringifyHashFields<T extends AnyObject>(obj: T) {
    return JSON.stringify(this.hashFields(obj))
  }

  static async toMap<T extends AnyObject>(objs: T[]): Promise<Record<Hash, T>> {
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
}
