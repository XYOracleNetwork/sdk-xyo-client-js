import { assertEx } from '@xylabs/assert'
import { fulfilled } from '@xylabs/promise'
import { AbstractArchivist } from '@xyo-network/abstract-archivist'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistCommitQuerySchema,
  ArchivistConfig,
  ArchivistDeleteQuerySchema,
  ArchivistFindQuerySchema,
  ArchivistInsertQuery,
  ArchivistInsertQuerySchema,
} from '@xyo-network/archivist-interface'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AnyConfigSchema, creatableModule, ModuleParams } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { PromisableArray } from '@xyo-network/promise'
import compact from 'lodash/compact'
import LruCache from 'lru-cache'

export type MemoryArchivistConfigSchema = 'network.xyo.module.config.archivist.memory'
export const MemoryArchivistConfigSchema: MemoryArchivistConfigSchema = 'network.xyo.module.config.archivist.memory'

export type MemoryArchivistConfig = ArchivistConfig<{
  max?: number
  schema: MemoryArchivistConfigSchema
}>

export type MemoryArchivistParams<TConfig extends AnyConfigSchema<MemoryArchivistConfig> = AnyConfigSchema<MemoryArchivistConfig>> =
  ModuleParams<TConfig>
@creatableModule()
export class MemoryArchivist<
  TParams extends MemoryArchivistParams<AnyConfigSchema<MemoryArchivistConfig>> = MemoryArchivistParams,
> extends AbstractArchivist<TParams> {
  static override configSchema = MemoryArchivistConfigSchema

  private _cache?: LruCache<string, Payload>

  get cache() {
    this._cache = this._cache ?? new LruCache<string, Payload>({ max: this.max })
    return this._cache
  }

  get max() {
    return this.config?.max ?? 10000
  }

  override get queries() {
    return [
      ArchivistAllQuerySchema,
      ArchivistDeleteQuerySchema,
      ArchivistClearQuerySchema,
      ArchivistFindQuerySchema,
      ArchivistInsertQuerySchema,
      ArchivistCommitQuerySchema,
      ...super.queries,
    ]
  }

  override all(): PromisableArray<Payload> {
    return compact(this.cache.dump().map((value) => value[1].value))
  }

  override clear(): void | Promise<void> {
    this.cache.clear()
  }

  override async commit(): Promise<BoundWitness[]> {
    const payloads = assertEx(await this.all(), 'Nothing to commit')
    const settled = await Promise.allSettled(
      compact(
        Object.values((await this.parents()).commit ?? [])?.map(async (parent) => {
          const queryPayload = PayloadWrapper.parse<ArchivistInsertQuery>({
            payloads: payloads.map((payload) => PayloadWrapper.hash(payload)),
            schema: ArchivistInsertQuerySchema,
          })
          const query = await this.bindQuery(queryPayload, payloads)
          return (await parent?.query(query[0], query[1]))?.[0]
        }),
      ),
    )
    await this.clear()
    return compact(settled.filter(fulfilled).map((result) => result.value))
  }

  override delete(hashes: string[]): PromisableArray<boolean> {
    return hashes.map((hash) => {
      return this.cache.delete(hash)
    })
  }

  override async get(hashes: string[]): Promise<Payload[]> {
    return compact(
      await Promise.all(
        hashes.map(async (hash) => {
          const payload = this.cache.get(hash) ?? (await super.get([hash]))[0] ?? null
          if (this.storeParentReads) {
            // NOTE: `payload` can actually be `null` here but TS doesn't seem
            // to recognize it. LRUCache claims not to support `null`s via their
            // types but seems to under the hood just fine.
            this.cache.set(hash, payload)
          }
          return payload
        }),
      ),
    )
  }

  async insert(payloads: Payload[]): Promise<BoundWitness[]> {
    payloads.map((payload) => {
      const wrapper = new PayloadWrapper(payload)
      const payloadWithMeta = { ...payload, _hash: wrapper.hash, _timestamp: Date.now() }
      this.cache.set(payloadWithMeta._hash, payloadWithMeta)
      return payloadWithMeta
    })

    const result = await this.bindResult([...payloads])
    const parentBoundWitnesses: BoundWitness[] = []
    const parents = await this.parents()
    if (Object.entries(parents.write ?? {}).length) {
      //we store the child bw also
      parentBoundWitnesses.push(...(await this.writeToParents([result[0], ...payloads])))
    }
    return [result[0], ...parentBoundWitnesses]
  }
}
