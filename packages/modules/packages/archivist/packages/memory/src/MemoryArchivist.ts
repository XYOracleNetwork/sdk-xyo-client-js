import { assertEx } from '@xylabs/assert'
import { Hash } from '@xylabs/hex'
import { compact } from '@xylabs/lodash'
import { fulfilled, Promisable } from '@xylabs/promise'
import { AbstractArchivist, addStorageMeta, removeStorageMeta, sortByStorageMeta, WithStorageMeta } from '@xyo-network/archivist-abstract'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistCommitQuerySchema,
  ArchivistConfig,
  ArchivistConfigSchema,
  ArchivistDeleteQuerySchema,
  ArchivistInsertQuery,
  ArchivistInsertQuerySchema,
  ArchivistInstance,
  ArchivistModuleEventData,
  ArchivistNextQuerySchema,
} from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AnyConfigSchema, creatableModule, ModuleInstance, ModuleParams } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, PayloadWithMeta, WithMeta } from '@xyo-network/payload-model'
import { LRUCache } from 'lru-cache'

export type MemoryArchivistConfigSchema = 'network.xyo.archivist.memory.config'
export const MemoryArchivistConfigSchema: MemoryArchivistConfigSchema = 'network.xyo.archivist.memory.config'

export type MemoryArchivistConfig = ArchivistConfig<{
  max?: number
  schema: MemoryArchivistConfigSchema | ArchivistConfig['schema']
}>

export type MemoryArchivistParams<TConfig extends AnyConfigSchema<MemoryArchivistConfig> = AnyConfigSchema<MemoryArchivistConfig>> =
  ModuleParams<TConfig>
@creatableModule()
export class MemoryArchivist<
    TParams extends MemoryArchivistParams<AnyConfigSchema<MemoryArchivistConfig>> = MemoryArchivistParams,
    TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
  >
  extends AbstractArchivist<TParams, TEventData>
  implements ArchivistInstance, ModuleInstance
{
  static override configSchemas = [MemoryArchivistConfigSchema, ArchivistConfigSchema]

  private _bodyHashIndex?: LRUCache<string, string>
  private _cache?: LRUCache<string, WithStorageMeta<PayloadWithMeta>>

  get bodyHashIndex() {
    this._bodyHashIndex = this._bodyHashIndex ?? new LRUCache<string, string>({ max: this.max })
    return this._bodyHashIndex
  }

  get cache() {
    this._cache = this._cache ?? new LRUCache<string, WithStorageMeta<PayloadWithMeta>>({ max: this.max })
    return this._cache
  }

  get max() {
    return this.config?.max ?? 10_000
  }

  override get queries() {
    return [
      ArchivistAllQuerySchema,
      ArchivistDeleteQuerySchema,
      ArchivistClearQuerySchema,
      ArchivistInsertQuerySchema,
      ArchivistCommitQuerySchema,
      ArchivistNextQuerySchema,
      ...super.queries,
    ]
  }

  protected override async allHandler(): Promise<PayloadWithMeta[]> {
    const all = compact(await Promise.all(this.cache.dump().map((value) => value[1].value)))
    return sortByStorageMeta(all).map((payload) => removeStorageMeta(payload))
  }

  protected override clearHandler(): void | Promise<void> {
    this.cache.clear()
    this.bodyHashIndex.clear()
    return this.emit('cleared', { module: this })
  }

  protected override async commitHandler(): Promise<WithMeta<BoundWitness>[]> {
    const payloads = assertEx(await this.allHandler(), 'Nothing to commit')
    const settled = await Promise.allSettled(
      compact(
        Object.values((await this.parents()).commit ?? [])?.map(async (parent) => {
          const queryPayload: ArchivistInsertQuery = {
            schema: ArchivistInsertQuerySchema,
          }
          const query = await this.bindQuery(queryPayload, payloads)
          return (await parent?.query(query[0], query[1]))?.[0]
        }),
      ),
    )
    await this.clearHandler()
    return compact(settled.filter(fulfilled).map((result) => result.value))
  }

  protected override async deleteHandler(hashes: Hash[]): Promise<Hash[]> {
    const deletedHashes = compact(
      await Promise.all(
        hashes.map((hash) => {
          return this.cache.delete(hash) ? hash : undefined
        }),
      ),
    )
    return deletedHashes
  }

  protected override getHandler(hashes: Hash[]): Promisable<PayloadWithMeta[]> {
    return compact(
      hashes.map((hash) => {
        const resolvedHash = this.bodyHashIndex.get(hash) ?? hash
        const result = this.cache.get(resolvedHash)
        if (resolvedHash !== hash && !result) {
          throw new Error('Missing referenced payload')
        }
        return removeStorageMeta(result)
      }),
    )
  }

  protected override async insertHandler(payloads: Payload[]): Promise<PayloadWithMeta[]> {
    const pairs = await PayloadBuilder.hashPairs(payloads)
    const insertedPayloads = await Promise.all(
      pairs.map(([payload, hash]) => {
        return this.insertPayloadIntoCache(payload, hash)
      }),
    )

    return insertedPayloads
  }

  protected override async nextHandler(previous?: Hash, limit?: number): Promise<PayloadWithMeta[]> {
    const all = sortByStorageMeta(compact(await Promise.all(this.cache.dump().map((value) => value[1].value))))
    const startIndex = previous ? all.findIndex((value) => value.$hash === previous) + 1 : 0
    return removeStorageMeta(all.slice(startIndex, limit ? startIndex + limit : undefined))
  }

  private insertPayloadIntoCache(payload: PayloadWithMeta, hash: string, index = 0): PayloadWithMeta {
    const withMeta = addStorageMeta(payload, index)
    this.cache.set(hash, withMeta)
    this.bodyHashIndex.set(withMeta.$hash, hash)
    return payload
  }
}
