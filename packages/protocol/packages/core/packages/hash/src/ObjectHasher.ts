import { cloneDeep } from '@xylabs/lodash'
import { Hash } from '@xyo-network/hash-model'
import { ObjectWrapper } from '@xyo-network/object'
import { WasmSupport } from '@xyo-network/wasm'
import { sha256 } from 'hash-wasm'
import shajs from 'sha.js'

import { sortFields } from './sortFields'

const wasmSupportStatic = new WasmSupport(['bigInt'])

export class ObjectHasher<T extends object = object> extends ObjectWrapper<T> {
  static readonly wasmInitialized = wasmSupportStatic.initialize()
  static readonly wasmSupport = wasmSupportStatic

  get hashFields() {
    return ObjectHasher.hashFields(this.obj)
  }

  get stringifiedHashFields() {
    return ObjectHasher.stringifyHashFields(this.obj)
  }

  static async filterExclude<T extends object>(objs: T[] = [], hash: Hash[] | Hash): Promise<T[]> {
    const hashes = Array.isArray(hash) ? hash : [hash]
    return (await this.hashPairs(objs)).filter(([_, objHash]) => !hashes.includes(objHash))?.map((pair) => pair[0])
  }

  static async filterInclude<T extends object>(objs: T[] = [], hash: Hash[] | Hash): Promise<T[]> {
    const hashes = Array.isArray(hash) ? hash : [hash]
    return (await this.hashPairs(objs)).filter(([_, objHash]) => hashes.includes(objHash))?.map((pair) => pair[0])
  }

  static async find<T extends object>(objs: T[] = [], hash: Hash): Promise<T | undefined> {
    return (await this.hashPairs(objs)).find(([_, objHash]) => objHash === hash)?.[0]
  }

  static async hashAsync(obj: object): Promise<Hash> {
    await ObjectHasher.wasmInitialized
    if (ObjectHasher.wasmSupport.canUseWasm) {
      const stringToHash = ObjectHasher.stringifyHashFields(obj)
      try {
        return await sha256(stringToHash)
      } catch (ex) {
        ObjectHasher.wasmSupport.allowWasm = false
      }
    }
    // eslint-disable-next-line deprecation/deprecation
    return this.hashSync(obj)
  }

  static hashFields<T extends object>(obj: T): T {
    return sortFields(cloneDeep(obj))
  }

  static async hashPairs<T extends object>(objs: T[]): Promise<[T, Hash][]> {
    return await Promise.all(objs.map<Promise<[T, string]>>(async (obj) => [obj, await ObjectHasher.hashAsync(obj)]))
  }

  static hashSync(obj: object): Hash {
    return shajs('sha256').update(this.stringifyHashFields(obj)).digest().toString('hex')
  }

  static async hashes(objs: object[]): Promise<Hash[]> {
    return await Promise.all(objs.map((obj) => this.hashAsync(obj)))
  }

  static stringifyHashFields(obj: object) {
    return JSON.stringify(this.hashFields(obj))
  }

  static async toMap<T extends object>(objs: T[]): Promise<Record<Hash, T>> {
    const result: Record<string, T> = {}
    await Promise.all(objs.map(async (obj) => (result[await ObjectHasher.hashAsync(obj)] = obj)))
    return result
  }

  async hashAsync(): Promise<Hash> {
    return await ObjectHasher.hashAsync(this.obj)
  }

  hashSync(): Hash {
    return ObjectHasher.hashSync(this.obj)
  }
}
