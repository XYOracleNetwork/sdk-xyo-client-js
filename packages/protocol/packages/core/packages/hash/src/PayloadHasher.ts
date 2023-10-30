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

  static decodeStrings<T extends AnyObject>(obj: T): T {
    return Object.entries(obj).reduce<Record<string, unknown>>((prev, [key, value]) => {
      prev[key] = this.decodeValue(value)
      return prev
    }, {}) as T
  }

  static decodeUTF16LE<T extends string>(input: T) {
    const binaryStr = atob(input)
    const cp = []
    for (let i = 0; i < binaryStr.length; i += 2) {
      cp.push(binaryStr.charCodeAt(i) | (binaryStr.charCodeAt(i + 1) << 8))
    }

    return String.fromCharCode(...cp)
  }

  static decodeValue<T>(value: T): T {
    if (value === null) {
      return null as T
    }
    if (Array.isArray(value)) {
      return value.map((item) => {
        return this.decodeValue(item)
      }) as T
    }
    switch (typeof value) {
      case 'string':
        return encodeURI(value) as T
      case 'object':
        return this.decodeStrings(value) as T
      default:
        return value
    }
  }

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
        const stringified = this.stringifyHashFields(obj)
        const bytes = enc.encode(stringified)
        const hashArray = await subtle.digest('SHA-256', bytes)
        return base16.encode(Buffer.from(hashArray)).toLowerCase()
      } catch (ex) {
        console.log('Setting allowSubtle to false')
        PayloadHasher.allowSubtle = false
      }
    }

    await this.wasmInitialized
    if (this.wasmSupport.canUseWasm) {
      const enc = new TextEncoder()
      const stringified = this.stringifyHashFields(obj)
      const bytes = enc.encode(stringified)
      try {
        return await sha256(bytes)
      } catch (ex) {
        this.wasmSupport.allowWasm = false
      }
    }
    return this.hashSync(obj)
  }

  static hashFields<T extends AnyObject>(obj: T): T {
    return sortFields(this.decodeStrings(removeEmptyFields(deepOmitUnderscoreFields(obj))))
  }

  static async hashPairs<T extends AnyObject>(objs: T[]): Promise<[T, Hash][]> {
    return await Promise.all(objs.map<Promise<[T, string]>>(async (obj) => [obj, await PayloadHasher.hashAsync(obj)]))
  }

  static hashSync<T extends AnyObject>(obj: T): Hash {
    const enc = new TextEncoder()
    const stringified = this.stringifyHashFields(obj)
    const bytes = enc.encode(stringified)
    return shajs('sha256').update(bytes).digest().toString('hex')
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
