import { assertEx } from '@xylabs/sdk-js'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoPayload, XyoPayloadWrapper } from '@xyo-network/payload'
import { PromisableArray } from '@xyo-network/promisable'
import compact from 'lodash/compact'
import store, { StoreBase } from 'store2'

import { XyoArchivistConfig } from './Config'
import { PartialArchivistConfig } from './PartialConfig'
import {
  XyoArchivistAllQuerySchema,
  XyoArchivistClearQuerySchema,
  XyoArchivistCommitQuerySchema,
  XyoArchivistDeleteQuerySchema,
  XyoArchivistFindQuerySchema,
  XyoArchivistInsertQuery,
  XyoArchivistInsertQuerySchema,
} from './Queries'
import { XyoArchivist } from './XyoArchivist'
import { XyoPayloadFindFilter } from './XyoPayloadFindFilter'

export type XyoStorageArchivistConfigSchema = 'network.xyo.module.config.archivist.storage'
export const XyoStorageArchivistConfigSchema: XyoStorageArchivistConfigSchema = 'network.xyo.module.config.archivist.storage'

export type XyoStorageArchivistConfig = XyoArchivistConfig<{
  schema: XyoStorageArchivistConfigSchema
  type?: 'local' | 'session' | 'page'
  namespace?: string
  maxEntries?: number
  maxEntrySize?: number
}>

class StorageArchivistError extends Error {
  constructor(action: string, error: Error['cause'], message?: string) {
    super(`Storage Archivist [${action}] failed${message ? ` (${message})` : ''}`, { cause: error })
  }
}

export class XyoStorageArchivist extends XyoArchivist<XyoStorageArchivistConfig> {
  public get type() {
    return this.config?.type ?? 'local'
  }

  public get namespace() {
    return this.config?.namespace ?? 'xyoarch'
  }

  public get maxEntries() {
    return this.config?.maxEntries ?? 1000
  }

  public get maxEntrySize() {
    return this.config?.maxEntries ?? 16000
  }

  public override queries() {
    return [
      XyoArchivistAllQuerySchema,
      XyoArchivistDeleteQuerySchema,
      XyoArchivistClearQuerySchema,
      XyoArchivistFindQuerySchema,
      XyoArchivistCommitQuerySchema,
      ...super.queries(),
    ]
  }

  private storage: StoreBase

  constructor(config?: PartialArchivistConfig<XyoStorageArchivistConfig>) {
    super({ ...config, schema: XyoStorageArchivistConfigSchema })
    this.storage = store[this.type].namespace(this.namespace)
  }

  public delete(hashes: string[]): PromisableArray<boolean> {
    try {
      return hashes.map((hash) => {
        this.storage.remove(hash)
        return true
      })
    } catch (ex) {
      throw new StorageArchivistError('delete', ex, 'unexpected')
    }
  }

  public override clear(): void | Promise<void> {
    try {
      this.storage.clear()
    } catch (ex) {
      throw new StorageArchivistError('clear', ex, 'unexpected')
    }
  }

  public async get(hashes: string[]): Promise<(XyoPayload | null)[]> {
    try {
      return await Promise.all(
        hashes.map(async (hash) => {
          const value = this.storage.get(hash)
          return value ?? (await this.getFromParents(hash)) ?? null
        }),
      )
    } catch (ex) {
      throw new StorageArchivistError('get', ex, 'unexpected')
    }
  }

  public async insert(payloads: XyoPayload[]): Promise<XyoBoundWitness> {
    try {
      const storedPayloads = payloads.map((payload) => {
        const wrapper = new XyoPayloadWrapper(payload)
        const hash = wrapper.hash
        const value = JSON.stringify(wrapper.payload)
        assertEx(value.length < this.maxEntrySize, `Payload too large [${wrapper.hash}, ${value.length}]`)
        this.storage.set(hash, wrapper.payload)
        return wrapper.payload
      })
      const boundwitness = this.bindPayloads(storedPayloads)
      if (this.writeThrough) {
        await this.writeToParents([boundwitness, ...storedPayloads])
      }
      return boundwitness
    } catch (ex) {
      throw new StorageArchivistError('insert', ex, 'unexpected')
    }
  }

  public async find(filter: XyoPayloadFindFilter): Promise<XyoPayload[]> {
    try {
      const x = (await this.all()).filter((payload) => {
        if (filter.schema && filter.schema !== payload.schema) {
          return false
        }
        return true
      })
      return x
    } catch (ex) {
      throw new StorageArchivistError('find', ex, 'unexpected')
    }
  }

  public all(): PromisableArray<XyoPayload> {
    try {
      return Object.entries(this.storage.getAll()).map(([, value]) => value)
    } catch (ex) {
      throw new StorageArchivistError('all', ex, 'unexpected')
    }
  }

  public async commit(): Promise<XyoBoundWitness> {
    try {
      const payloads = await this.all()
      assertEx(payloads.length > 0, 'Nothing to commit')
      const block = this.bindPayloads(payloads)
      await Promise.allSettled(
        compact(
          Object.values(this.parents?.commit ?? [])?.map(async (parent) => {
            const query: XyoArchivistInsertQuery = { payloads: [block, ...payloads], schema: XyoArchivistInsertQuerySchema }
            return await parent?.query(query)
          }),
        ),
      )
      await this.clear()
      return block
    } catch (ex) {
      throw new StorageArchivistError('commit', ex, 'unexpected')
    }
  }
}
