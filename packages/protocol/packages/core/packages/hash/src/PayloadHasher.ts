import { asHash, Hash, hexFromArrayBuffer } from '@xylabs/hex'
import { EmptyObject, ObjectWrapper } from '@xylabs/object'
import { WasmSupport } from '@xyo-network/wasm'
import { Semaphore } from 'async-mutex'
import shajs from 'sha.js'
import { spawn, Worker } from 'threads'

import { removeEmptyFields } from './removeEmptyFields'
import { deepOmitPrefixedFields } from './removeFields'
import { sortFields } from './sortFields'

const wasmSupportStatic = new WasmSupport(['bigInt'])
const maxHashThreads = 8
const maxListenersPerThread = 1

export class PayloadHasher<T extends EmptyObject = EmptyObject> extends ObjectWrapper<T> {
  static allowSubtle = true

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static readonly jsHashThreads: any[] = []
  static readonly jsSemaphore = new Semaphore(maxHashThreads * maxListenersPerThread)

  static lastJsThreadUsed: number
  static lastSubtleThreadUsed: number
  static lastWasmThreadUsed: number

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static readonly subtleHashThreads: any[] = []
  static readonly subtleSemaphore = new Semaphore(maxHashThreads * maxListenersPerThread)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static readonly wasmHashThreads: any[] = []

  static readonly wasmInitialized = wasmSupportStatic.initialize()
  static readonly wasmSemaphore = new Semaphore(maxHashThreads * maxListenersPerThread)
  static readonly wasmSupport = wasmSupportStatic

  static async filterExcludeByHash<T extends EmptyObject>(objs: T[] = [], hash: Hash[] | Hash): Promise<T[]> {
    const hashes = Array.isArray(hash) ? hash : [hash]
    return (await this.hashPairs(objs)).filter(([_, objHash]) => !hashes.includes(objHash))?.map((pair) => pair[0])
  }

  static async filterIncludeByHash<T extends EmptyObject>(objs: T[] = [], hash: Hash[] | Hash): Promise<T[]> {
    const hashes = Array.isArray(hash) ? hash : [hash]
    return (await this.hashPairs(objs)).filter(([_, objHash]) => hashes.includes(objHash))?.map((pair) => pair[0])
  }

  static async findByHash<T extends EmptyObject>(objs: T[] = [], hash: Hash): Promise<T | undefined> {
    return (await this.hashPairs(objs)).find(([_, objHash]) => objHash === hash)?.[0]
  }

  /**
   * Asynchronously hashes a payload
   * @param obj A payload
   * @returns The payload hash
   */
  static async hash<T extends EmptyObject>(obj: T): Promise<Hash> {
    const stringToHash = this.stringifyHashFields(obj)

    if (PayloadHasher.allowSubtle) {
      try {
        const enc = new TextEncoder()
        const data = enc.encode(stringToHash)
        const hashArray = await this.subtleHash(data)
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
      try {
        return this.wasmHash(stringToHash)
      } catch {
        this.wasmSupport.allowWasm = false
      }
    }
    return await this.jsHash(stringToHash)
  }

  static hashFields<T extends EmptyObject>(obj: T): T {
    return sortFields(removeEmptyFields(deepOmitPrefixedFields(obj, '_')))
  }

  /**
   * Creates an array of payload/hash tuples based on the payloads passed in
   * @param objs Any array of payloads
   * @returns An array of payload/hash tuples
   */
  static async hashPairs<T extends EmptyObject>(objs: T[]): Promise<[T, Hash][]> {
    return await Promise.all(objs.map<Promise<[T, string]>>(async (obj) => [obj, await PayloadHasher.hash(obj)]))
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
  static async hashes<T extends EmptyObject>(objs?: T[]): Promise<Hash[] | undefined> {
    return objs ? await Promise.all(objs.map((obj) => this.hash(obj))) : undefined
  }

  static async jsHash(data: string) {
    await this.jsSemaphore.acquire()
    try {
      if (this.jsHashThreads.length < maxHashThreads) {
        const w = new Worker('./worker/jsHash.js')
        const worker = await spawn(w)
        this.jsHashThreads.push(worker)
      }
      let threadToUse = this.lastJsThreadUsed === undefined ? 0 : this.lastJsThreadUsed + 1
      if (threadToUse >= this.jsHashThreads.length) {
        threadToUse = 0
      }
      this.lastJsThreadUsed = threadToUse

      return await this.jsHashThreads[threadToUse].hash(data)
    } finally {
      this.jsSemaphore.release()
    }
  }

  /**
   * Returns a clone of the payload that is JSON safe
   * @param obj A payload
   * @param meta Keeps underscore (meta) fields if set to true
   * @returns Returns a clone of the payload that is JSON safe
   */
  static json<T extends EmptyObject>(payload: T, meta = false): T {
    return sortFields(removeEmptyFields(meta ? payload : deepOmitPrefixedFields(payload, '_')))
  }

  /** @deprecated us json instead */
  static jsonPayload<T extends EmptyObject>(payload: T, meta = false): T {
    return this.json(payload, meta)
  }

  static stringifyHashFields<T extends EmptyObject>(obj: T) {
    return JSON.stringify(this.hashFields(obj))
  }

  static async subtleHash(data: Uint8Array): Promise<ArrayBuffer> {
    await this.subtleSemaphore.acquire()
    try {
      if (this.subtleHashThreads.length < maxHashThreads) {
        const w = new Worker('./worker/subtleHash.js')
        const worker = await spawn(w)
        this.subtleHashThreads.push(worker)
      }
      let threadToUse = this.lastSubtleThreadUsed === undefined ? 0 : this.lastSubtleThreadUsed + 1
      if (threadToUse >= this.subtleHashThreads.length) {
        threadToUse = 0
      }
      this.lastSubtleThreadUsed = threadToUse

      return await this.subtleHashThreads[threadToUse].hash(data)
    } finally {
      this.subtleSemaphore.release()
    }
  }

  static async wasmHash(data: string) {
    await this.wasmSemaphore.acquire()
    try {
      if (this.wasmHashThreads.length < maxHashThreads) {
        const w = new Worker('./worker/wasmHash.js')
        const worker = await spawn(w)
        this.wasmHashThreads.push(worker)
      }
      let threadToUse = this.lastWasmThreadUsed === undefined ? 0 : this.lastWasmThreadUsed + 1
      if (threadToUse >= this.wasmHashThreads.length) {
        threadToUse = 0
      }
      this.lastWasmThreadUsed = threadToUse

      return await this.wasmHashThreads[threadToUse].hash(data)
    } finally {
      this.wasmSemaphore.release()
    }
  }

  async hash(): Promise<Hash> {
    return await PayloadHasher.hash(this.obj)
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
