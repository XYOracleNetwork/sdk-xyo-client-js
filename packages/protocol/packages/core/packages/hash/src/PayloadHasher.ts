import { assertEx } from '@xylabs/assert'
import { asHash, Hash, hexFromArrayBuffer } from '@xylabs/hex'
import { EmptyObject, ObjectWrapper } from '@xylabs/object'
import { subtle } from '@xylabs/platform'
import { ModuleThread, Pool, spawn, Worker } from '@xylabs/threads'
// eslint-disable-next-line import/no-internal-modules
import { WorkerModule } from '@xylabs/threads/dist/types/worker'
import { WasmSupport } from '@xyo-network/wasm'
import { sha256 } from 'hash-wasm'
import shajs from 'sha.js'

import { removeEmptyFields } from './removeEmptyFields'
import { deepOmitPrefixedFields } from './removeFields'
import { sortFields } from './sortFields'
import { jsHashFunc, subtleHashFunc, wasmHashFunc } from './worker'

const wasmSupportStatic = new WasmSupport(['bigInt'])

export class PayloadHasher<T extends EmptyObject = EmptyObject> extends ObjectWrapper<T> {
  static allowHashPooling = true
  static allowSubtle = true
  static createBrowserWorker?: (url?: URL) => Worker | undefined
  static createNodeWorker?: (func?: () => unknown) => Worker | undefined

  static initialized = (() => {
    globalThis.xyo = globalThis.xyo ?? {}
    if (globalThis.xyo.hashing) {
      console.warn('Two static instances of PayloadHasher detected')
    }
    globalThis.xyo === globalThis.xyo ?? { hashing: PayloadHasher }
  })()

  static jsHashWorkerUrl?: URL
  static subtleHashWorkerUrl?: URL

  static warnIfUsingJsHash = true

  static wasmHashWorkerUrl?: URL

  static readonly wasmInitialized = wasmSupportStatic.initialize()
  static readonly wasmSupport = wasmSupportStatic

  // These get set to null if they fail to create and then we just don't use workers - needed for storybook
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static _jsHashPool?: Pool<ModuleThread<WorkerModule<any>>> | null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static _subtleHashPool?: Pool<ModuleThread<WorkerModule<any>>> | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static _wasmHashPool?: Pool<ModuleThread<WorkerModule<any>>> | null

  private static get jsHashPool() {
    if (!this.allowHashPooling || this._jsHashPool === null) {
      return null
    }
    try {
      return (this._jsHashPool = this._jsHashPool ?? (this.jsHashWorkerUrl ? this.createWorkerPool(this.jsHashWorkerUrl, jsHashFunc) : null))
    } catch {
      console.warn('Creating js hash worker failed')
      this._jsHashPool = null
      return null
    }
  }

  private static get subtleHashPool() {
    if (!this.allowHashPooling || this._subtleHashPool === null) {
      return null
    }
    try {
      return (this._subtleHashPool =
        this._subtleHashPool ?? (this.subtleHashWorkerUrl ? this.createWorkerPool(this.subtleHashWorkerUrl, subtleHashFunc) : null))
    } catch {
      console.warn('Creating subtle hash worker failed')
      this._subtleHashPool = null
      return null
    }
  }

  private static get wasmHashPool() {
    if (!this.allowHashPooling || this._wasmHashPool === null) {
      return null
    }
    try {
      return (this._wasmHashPool =
        this._wasmHashPool ?? (this.wasmHashWorkerUrl ? this.createWorkerPool(this.wasmHashWorkerUrl, wasmHashFunc) : null))
    } catch {
      console.warn('Creating wasm hash worker failed')
      this._wasmHashPool = null
      return null
    }
  }

  static createWorker(url?: URL, func?: () => unknown) {
    if (url) console.debug(`createWorker: ${url}`)
    return assertEx(this.createBrowserWorker?.(url) ?? this.createNodeWorker?.(func), 'Unable to create worker')
  }

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
      } catch {
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
    return await Promise.all(objs.map<Promise<[T, Hash]>>(async (obj) => [obj, await PayloadHasher.hash(obj)]))
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
    if (PayloadHasher.warnIfUsingJsHash) {
      console.warn('Using jsHash [No subtle or wasm?]')
    }
    const pool = this.jsHashPool
    return pool === null ?
        asHash(shajs('sha256').update(data).digest().toString('hex'), true)
      : await pool.queue(async (thread) => await thread.hash(data))
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
    const pool = this.subtleHashPool
    return pool === null ? await subtle.digest('SHA-256', data) : await pool.queue(async (thread) => await thread.hash(data))
  }

  static async wasmHash(data: string) {
    const pool = this.wasmHashPool
    return pool === null ? asHash(await sha256(data), true) : pool.queue(async (thread) => await thread.hash(data))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static createWorkerPool<T extends WorkerModule<any>>(url?: URL, func?: () => unknown, size = 8) {
    if (url) console.debug(`createWorkerPool: ${url}`)
    const createFunc = () => spawn<T>(this.createWorker(url, func))
    return Pool(createFunc, size)
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
