/* eslint-disable sonarjs/public-static-readonly */
/* eslint-disable sonarjs/no-nested-assignment */
import { assertEx } from '@xylabs/assert'
import type { Hash } from '@xylabs/hex'
import { asHash, hexFromArrayBuffer } from '@xylabs/hex'
import type { EmptyObject } from '@xylabs/object'
import { ObjectWrapper, omitBy } from '@xylabs/object'
import { subtle } from '@xylabs/platform'
import type { ModuleThread, Worker } from '@xylabs/threads'
import { Pool, spawn } from '@xylabs/threads'
import { WasmSupport } from '@xyo-network/wasm'
import { sha256 } from 'hash-wasm'

import { removeEmptyFields } from './removeEmptyFields.ts'
import { sortFields } from './sortFields.ts'
import { subtleHashFunc, wasmHashFunc } from './worker/index.ts'

export type WorkerFunction = ((...args: unknown[]) => unknown) | (() => unknown)
export type WorkerModule<Keys extends string> = {
  [key in Keys]: WorkerFunction
}

const wasmSupportStatic = new WasmSupport(['bigInt'])

const omitByPredicate = (prefix: string) => (_: unknown, key: string) => {
  assertEx(typeof key === 'string', () => `Invalid key type [${String(key)}, ${typeof key}]`)
  return String(key).startsWith(prefix)
}

export class ObjectHasher<T extends EmptyObject = EmptyObject> extends ObjectWrapper<T> {
  static allowHashPooling = true
  static allowSubtle = true
  static createBrowserWorker?: (url?: URL) => Worker | undefined
  static createNodeWorker?: (func?: () => unknown) => Worker | undefined

  static readonly initialized = (() => {
    globalThis.xyo = globalThis.xyo ?? {}
    if (globalThis.xyo.hashing) {
      console.warn('Two static instances of PayloadHasher detected')
    }
  })()

  static readonly subtleHashWorkerUrl?: URL

  static warnIfUsingJsHash = true

  static readonly wasmHashWorkerUrl?: URL

  static readonly wasmInitialized = wasmSupportStatic.initialize()
  static readonly wasmSupport = wasmSupportStatic

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static _subtleHashPool?: Pool<ModuleThread<WorkerModule<any>>> | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static _wasmHashPool?: Pool<ModuleThread<WorkerModule<any>>> | null

  private static get subtleHashPool() {
    if (!this.allowHashPooling || this._subtleHashPool === null) {
      return null
    }
    try {
      return (this._subtleHashPool
        = this._subtleHashPool ?? (this.subtleHashWorkerUrl ? this.createWorkerPool(this.subtleHashWorkerUrl, subtleHashFunc) : null))
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
      return (this._wasmHashPool
        = this._wasmHashPool ?? (this.wasmHashWorkerUrl ? this.createWorkerPool(this.wasmHashWorkerUrl, wasmHashFunc) : null))
    } catch {
      console.warn('Creating wasm hash worker failed')
      this._wasmHashPool = null
      return null
    }
  }

  static createWorker(url?: URL, func?: () => unknown) {
    if (url) console.debug(`createWorker: ${url}`)
    return assertEx(this.createBrowserWorker?.(url) ?? this.createNodeWorker?.(func), () => 'Unable to create worker')
  }

  static async filterExcludeByHash<T extends EmptyObject>(objs: T[] = [], hash: Hash[] | Hash): Promise<T[]> {
    const hashes = Array.isArray(hash) ? hash : [hash]
    return (await this.hashPairs(objs)).filter(([_, objHash]) => !hashes.includes(objHash))?.map(pair => pair[0])
  }

  static async filterIncludeByHash<T extends EmptyObject>(objs: T[] = [], hash: Hash[] | Hash): Promise<T[]> {
    const hashes = Array.isArray(hash) ? hash : [hash]
    return (await this.hashPairs(objs)).filter(([_, objHash]) => hashes.includes(objHash))?.map(pair => pair[0])
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

    if (ObjectHasher.allowSubtle) {
      try {
        const enc = new TextEncoder()
        const data = enc.encode(stringToHash)
        const hashArray = await this.subtleHash(data)
        return hexFromArrayBuffer(hashArray, { bitLength: 256 })
      } catch {
        ObjectHasher.allowSubtle = false
      }
    }

    await this.wasmInitialized
    if (this.wasmSupport.canUseWasm) {
      try {
        return await this.wasmHash(stringToHash)
      } catch {
        this.wasmSupport.allowWasm = false
      }
    }
    throw new Error('No wasm hashing available')
  }

  static hashFields<T extends EmptyObject>(obj: T): T {
    return sortFields(removeEmptyFields(omitBy(obj, omitByPredicate('_')))) as T
  }

  /**
   * Creates an array of payload/hash tuples based on the payloads passed in
   * @param objs Any array of payloads
   * @returns An array of payload/hash tuples
   */
  static async hashPairs<T extends EmptyObject>(objs: T[]): Promise<[T, Hash][]> {
    return await Promise.all(objs.map<Promise<[T, Hash]>>(async obj => [obj, await ObjectHasher.hash(obj)]))
  }

  /**
   * Creates an array of payload hashes based on the payloads passed in
   * @param objs Any array of payloads
   * @returns An array of payload hashes
   */
  static async hashes<T extends EmptyObject>(objs?: T[]): Promise<Hash[] | undefined> {
    return objs ? await Promise.all(objs.map(obj => this.hash(obj))) : undefined
  }

  /**
   * Returns a clone of the payload that is JSON safe
   * @param obj A payload
   * @param meta Keeps underscore (meta) fields if set to true
   * @returns Returns a clone of the payload that is JSON safe
   */
  static json<T extends EmptyObject>(payload: T, meta = false): T {
    return sortFields(removeEmptyFields(meta ? payload : omitBy(payload, omitByPredicate('_')))) as T
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
    return pool === null ? await subtle.digest('SHA-256', data) : pool.queue(async thread => await thread.hash(data))
  }

  static async wasmHash(data: string) {
    const pool = this.wasmHashPool
    return pool === null ? asHash(await sha256(data), true) : pool.queue(async thread => await thread.hash(data))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static createWorkerPool<T extends WorkerModule<any>>(url?: URL, func?: () => unknown, size = 8) {
    if (url) console.debug(`createWorkerPool: ${url}`)
    const createFunc = () => spawn<T>(this.createWorker(url, func))
    return Pool(createFunc, size)
  }

  async hash(): Promise<Hash> {
    return await ObjectHasher.hash(this.obj)
  }

  /**
   * Returns a clone of the payload that is JSON safe
   * @param meta Keeps underscore (meta) fields if set to true
   * @returns Returns a clone of the payload that is JSON safe
   */
  json(meta = false): T {
    return ObjectHasher.json(this.obj, meta)
  }
}

/** @deprecated use PayloadBuilder or ObjectHasher instead */
export class PayloadHasher<T extends object> extends ObjectHasher<T> {}
