import { sha256 } from 'hash-wasm'
import shajs from 'sha.js'

import { AnyObject, ObjectWrapper } from '../lib'
import { WasmSupport } from '../Wasm'
import { removeEmptyFields } from './removeEmptyFields'
import { deepOmitUnderscoreFields } from './removeFields'
import { sortFields } from './sortFields'

const wasmSupportStatic = new WasmSupport(['bigInt'])

export class PayloadHasher<T extends object = object> extends ObjectWrapper<T> {
  static readonly wasmInitialized = wasmSupportStatic.initialize()
  static readonly wasmSupport = wasmSupportStatic

  /** @deprecated use hashAsync instead */
  get hash() {
    // eslint-disable-next-line deprecation/deprecation
    return PayloadHasher.hash(this.obj)
  }

  get hashFields() {
    return PayloadHasher.hashFields(this.obj)
  }

  get stringified() {
    return PayloadHasher.stringify(this.obj)
  }

  static async filterExclude<T extends AnyObject>(objs: T[] = [], hash: string[] | string): Promise<T[]> {
    const hashes = Array.isArray(hash) ? hash : [hash]
    return (await this.hashPairs(objs)).filter(([_, objHash]) => !hashes.includes(objHash))?.map((pair) => pair[0])
  }

  static async filterInclude<T extends AnyObject>(objs: T[] = [], hash: string[] | string): Promise<T[]> {
    const hashes = Array.isArray(hash) ? hash : [hash]
    return (await this.hashPairs(objs)).filter(([_, objHash]) => hashes.includes(objHash))?.map((pair) => pair[0])
  }

  static async find<T extends AnyObject>(objs: T[] = [], hash: string): Promise<T | undefined> {
    return (await this.hashPairs(objs)).find(([_, objHash]) => objHash === hash)?.[0]
  }

  /** @deprecated use hashSync or hashAsync instead */
  static hash<T extends AnyObject>(obj: T) {
    return shajs('sha256').update(this.stringify(obj)).digest().toString('hex')
  }

  static async hashAsync<T extends AnyObject>(obj: T): Promise<string> {
    await PayloadHasher.wasmInitialized
    if (PayloadHasher.wasmSupport.canUseWasm) {
      const stringToHash = this.stringify(obj)
      try {
        return await sha256(stringToHash)
      } catch (ex) {
        PayloadHasher.wasmSupport.allowWasm = false
      }
    }
    // eslint-disable-next-line deprecation/deprecation
    return this.hash(obj)
  }

  static hashFields<T extends AnyObject>(obj: T) {
    return removeEmptyFields(deepOmitUnderscoreFields(obj))
  }

  static async hashPairs<T extends AnyObject>(objs: T[]): Promise<[T, string][]> {
    return await Promise.all(objs.map<Promise<[T, string]>>(async (obj) => [obj, await PayloadHasher.hashAsync(obj)]))
  }

  static hashSync<T extends AnyObject>(obj: T) {
    return shajs('sha256').update(this.stringify(obj)).digest().toString('hex')
  }

  static async hashes<T extends AnyObject>(objs: T[]) {
    return await Promise.all(objs.map((obj) => this.hashAsync(obj)))
  }

  static stringify<T extends AnyObject>(obj: T) {
    return JSON.stringify(sortFields(this.hashFields(obj)))
  }

  static async toMap<T extends AnyObject>(objs: T[]): Promise<Record<string, T>> {
    const result: Record<string, T> = {}
    await Promise.all(objs.map(async (obj) => (result[await PayloadHasher.hashAsync(obj)] = obj)))
    return result
  }

  async hashAsync() {
    return await PayloadHasher.hashAsync(this.obj)
  }
}

/** @deprecated use PayloadHasher instead */
export class Hasher<T extends object> extends PayloadHasher<T> {}
