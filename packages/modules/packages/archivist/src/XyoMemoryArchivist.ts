import { assertEx } from '@xylabs/sdk-js'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoPayload, XyoPayloadWrapper } from '@xyo-network/payload'
import { PromisableArray } from '@xyo-network/promise'
import compact from 'lodash/compact'
import LruCache from 'lru-cache'

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

export type XyoMemoryArchivistConfigSchema = 'network.xyo.module.config.archivist.memory'
export const XyoMemoryArchivistConfigSchema: XyoMemoryArchivistConfigSchema = 'network.xyo.module.config.archivist.memory'

export type XyoMemoryArchivistConfig = XyoArchivistConfig<{
  schema: XyoMemoryArchivistConfigSchema
  max?: number
}>

class MemoryArchivistError extends Error {
  constructor(action: string, error: Error['cause'], message?: string) {
    super(`Memory Archivist [${action}] failed${message ? ` (${message})` : ''}`, { cause: error })
  }
}

export class XyoMemoryArchivist extends XyoArchivist<XyoMemoryArchivistConfig> {
  static create(config?: XyoMemoryArchivistConfig) {
    return new XyoMemoryArchivist(config)
  }

  public get max() {
    return this.config?.max ?? 10000
  }

  private cache: LruCache<string, XyoPayload>

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

  constructor(config?: PartialArchivistConfig<XyoMemoryArchivistConfig>) {
    super({ ...config, schema: XyoMemoryArchivistConfigSchema })
    this.cache = new LruCache<string, XyoPayload>({ max: this.max })
  }

  public delete(hashes: string[]): PromisableArray<boolean> {
    try {
      return hashes.map((hash) => {
        return this.cache.delete(hash)
      })
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw new MemoryArchivistError('delete', ex, 'unexpected')
    }
  }

  public override clear(): void | Promise<void> {
    try {
      this.cache.clear()
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw new MemoryArchivistError('clear', ex, 'unexpected')
    }
  }

  public async get(hashes: string[]): Promise<(XyoPayload | null)[]> {
    try {
      return await Promise.all(
        hashes.map(async (hash) => {
          const payload = this.cache.get(hash) ?? (await this.getFromParents(hash)) ?? null
          if (this.cacheParentReads) {
            this.cache.set(hash, payload)
          }
          return payload
        }),
      )
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw new MemoryArchivistError('get', ex, 'unexpected')
    }
  }

  public async insert(payloads: XyoPayload[]): Promise<XyoBoundWitness> {
    try {
      payloads.map((payload) => {
        const wrapper = new XyoPayloadWrapper(payload)
        const payloadWithmeta = { ...payload, _hash: wrapper.hash, _timestamp: Date.now() }
        this.cache.set(payloadWithmeta._hash, payloadWithmeta)
        return payloadWithmeta
      })
      const [boundwitness] = await this.bindPayloads(payloads)
      if (this.writeThrough) {
        await this.writeToParents(payloads)
      }
      return boundwitness
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw new MemoryArchivistError('insert', ex, 'unexpected')
    }
  }

  public find<R extends XyoPayload = XyoPayload>(filter: XyoPayloadFindFilter): PromisableArray<R> {
    try {
      const result: R[] = []
      this.cache.forEach((value) => {
        if (value.schema === filter.schema) {
          result.push(value as R)
        }
      })
      return result
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw new MemoryArchivistError('find', ex, 'unexpected')
    }
  }

  public all(): PromisableArray<XyoPayload> {
    try {
      return this.cache.dump().map((value) => value[1].value)
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw new MemoryArchivistError('all', ex, 'unexpected')
    }
  }

  public async commit(): Promise<XyoBoundWitness> {
    try {
      const payloads = assertEx(await this.all(), 'Nothing to commit')
      const [block] = await this.bindPayloads(payloads)
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
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw new MemoryArchivistError('commit', ex, 'unexpected')
    }
  }
}
