import { assertEx } from '@xylabs/assert'
import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoModuleResolverFunc } from '@xyo-network/module'
import { PayloadWrapper, XyoPayload } from '@xyo-network/payload'
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

  constructor(config?: PartialArchivistConfig<XyoMemoryArchivistConfig>, account?: XyoAccount, resolver?: XyoModuleResolverFunc) {
    super({ ...config, schema: XyoMemoryArchivistConfigSchema }, account, resolver)
    this.cache = new LruCache<string, XyoPayload>({ max: this.max })
  }

  public override delete(hashes: string[]): PromisableArray<boolean> {
    try {
      return hashes.map((hash) => {
        return this.cache.delete(hash)
      })
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw ex
    }
  }

  public override clear(): void | Promise<void> {
    try {
      this.cache.clear()
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw ex
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
      throw ex
    }
  }

  public async insert(payloads: XyoPayload[]): Promise<XyoBoundWitness[]> {
    try {
      payloads.map((payload) => {
        const wrapper = new PayloadWrapper(payload)
        const payloadWithMeta = { ...payload, _hash: wrapper.hash, _timestamp: Date.now() }
        this.cache.set(payloadWithMeta._hash, payloadWithMeta)
        return payloadWithMeta
      })

      const result = await this.bindResult([...payloads])
      const parentBoundWitnesses: XyoBoundWitness[] = []
      if (this.writeThrough) {
        //we store the child bw also
        parentBoundWitnesses.push(...(await this.writeToParents([result[0], ...payloads])))
      }
      return [result[0], ...parentBoundWitnesses]
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw ex
    }
  }

  public override find<R extends XyoPayload = XyoPayload>(filter: XyoPayloadFindFilter): PromisableArray<R> {
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
      throw ex
    }
  }

  public override all(): PromisableArray<XyoPayload> {
    try {
      return this.cache.dump().map((value) => value[1].value)
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw ex
    }
  }

  public override async commit(): Promise<XyoBoundWitness[]> {
    try {
      const payloads = assertEx(await this.all(), 'Nothing to commit')
      const settled = await Promise.allSettled(
        compact(
          Object.values(this.parents?.commit ?? [])?.map(async (parent) => {
            const queryPayload = PayloadWrapper.parse<XyoArchivistInsertQuery>({
              payloads: payloads.map((payload) => PayloadWrapper.hash(payload)),
              schema: XyoArchivistInsertQuerySchema,
            })
            const query = await this.bindQuery(queryPayload)
            return (await parent?.query(query[0], query[1]))?.[0]
          }),
        ),
      )
      await this.clear()
      return compact(
        settled.map((result) => {
          return result.status === 'fulfilled' ? result.value : null
        }),
      )
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw ex
    }
  }
}
