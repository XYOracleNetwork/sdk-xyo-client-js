import { assertEx } from '@xylabs/sdk-js'
import { XyoBoundWitness, XyoBoundWitnessBuilder } from '@xyo-network/boundwitness'
import { XyoPayload, XyoPayloadWrapper } from '@xyo-network/payload'
import { PromisableArray } from '@xyo-network/promisable'
import compact from 'lodash/compact'
import LruCache from 'lru-cache'

import { XyoAbstractArchivist } from './Abstract'
import {
  XyoArchivistAllQueryPayloadSchema,
  XyoArchivistClearQueryPayloadSchema,
  XyoArchivistCommitQueryPayloadSchema,
  XyoArchivistDeleteQueryPayloadSchema,
  XyoArchivistFindQueryPayloadSchema,
  XyoArchivistGetQueryPayloadSchema,
  XyoArchivistInsertQueryPayloadSchema,
} from './Query'
import { XyoArchivistConfig } from './XyoArchivistConfig'
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

export class XyoMemoryArchivist extends XyoAbstractArchivist<XyoMemoryArchivistConfig> {
  public get max() {
    return this.config?.max ?? 10000
  }

  private cache: LruCache<string, XyoPayload>

  public override get queries() {
    return [
      ...super.queries,
      XyoArchivistAllQueryPayloadSchema,
      XyoArchivistDeleteQueryPayloadSchema,
      XyoArchivistClearQueryPayloadSchema,
      XyoArchivistFindQueryPayloadSchema,
      XyoArchivistCommitQueryPayloadSchema,
    ]
  }

  constructor(config: XyoMemoryArchivistConfig) {
    super(config)
    this.cache = new LruCache<string, XyoPayload>({ max: this.max })
  }

  public delete(hashes: string[]): PromisableArray<boolean> {
    try {
      return hashes.map((hash) => {
        return this.cache.delete(hash)
      })
    } catch (ex) {
      throw new MemoryArchivistError('delete', ex, 'unexpected')
    }
  }

  public override clear(): void | Promise<void> {
    try {
      this.cache.clear()
    } catch (ex) {
      throw new MemoryArchivistError('clear', ex, 'unexpected')
    }
  }

  protected async getFromParents(hash: string) {
    return compact(
      await Promise.all(
        compact(
          Object.values(this.parents?.read ?? {}).map(async (parent) => {
            const [, payloads] = (await parent?.query({ hashes: [hash], schema: XyoArchivistGetQueryPayloadSchema })) ?? []
            return payloads?.[0]
          }),
        ),
      ),
    )[0]
  }

  public async get(hashes: string[]): Promise<(XyoPayload | null)[]> {
    try {
      return await Promise.all(
        hashes.map(async (hash) => {
          return this.cache.get(hash) ?? (await this.getFromParents(hash)) ?? null
        }),
      )
    } catch (ex) {
      throw new MemoryArchivistError('get', ex, 'unexpected')
    }
  }

  public insert(payloads: XyoPayload[]): PromisableArray<XyoPayload> {
    try {
      return payloads.map((payload) => {
        const wrapper = new XyoPayloadWrapper(payload)
        const payloadWithmeta = { ...payload, _hash: wrapper.hash, _timestamp: Date.now() }
        this.cache.set(payloadWithmeta._hash, payloadWithmeta)
        return payloadWithmeta
      })
    } catch (ex) {
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
      throw new MemoryArchivistError('find', ex, 'unexpected')
    }
  }

  public all(): Promise<XyoPayload[]> | XyoPayload[] {
    try {
      return this.cache.dump().map((value) => value[1].value)
    } catch (ex) {
      throw new MemoryArchivistError('all', ex, 'unexpected')
    }
  }

  public async commit(): Promise<XyoPayload[]> {
    try {
      const account = assertEx(this.account, 'Account is required for commit')
      const payloads = assertEx(await this.all(), 'Nothing to commit')
      const builder = new XyoBoundWitnessBuilder<XyoBoundWitness, XyoPayload>()
      const block = builder.payloads(payloads).witness(account).build()
      await Promise.allSettled(
        compact(
          Object.values(this.parents?.commit ?? [])?.map(
            async (parent) => await parent?.query({ payloads: [block, ...payloads], schema: XyoArchivistInsertQueryPayloadSchema }),
          ),
        ),
      )
      await this.clear()
      return payloads
    } catch (ex) {
      throw new MemoryArchivistError('commit', ex, 'unexpected')
    }
  }
}
