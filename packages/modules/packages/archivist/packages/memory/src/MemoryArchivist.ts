import { assertEx } from '@xylabs/assert'
import { Hash } from '@xylabs/hex'
import { compact } from '@xylabs/lodash'
import { fulfilled, Promisable, PromisableArray } from '@xylabs/promise'
import { AbstractArchivist } from '@xyo-network/archivist-abstract'
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
} from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadHasher } from '@xyo-network/hash'
import { AnyConfigSchema, creatableModule, ModuleInstance, ModuleParams } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, PayloadWithMeta } from '@xyo-network/payload-model'
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
  private _cache?: LRUCache<string, PayloadWithMeta>

  get bodyHashIndex() {
    this._bodyHashIndex = this._bodyHashIndex ?? new LRUCache<string, string>({ max: this.max })
    return this._bodyHashIndex
  }

  get cache() {
    this._cache = this._cache ?? new LRUCache<string, PayloadWithMeta>({ max: this.max })
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
      ...super.queries,
    ]
  }

  protected override allHandler(): PromisableArray<Payload> {
    return compact(this.cache.dump().map((value) => PayloadHasher.hashFields(value[1].value)))
  }

  protected override clearHandler(): void | Promise<void> {
    this.cache.clear()
    this.bodyHashIndex.clear()
    return this.emit('cleared', { module: this })
  }

  protected override async commitHandler(): Promise<BoundWitness[]> {
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

  protected override async deleteHandler(hashes: Hash[]): Promise<string[]> {
    const deletedHashes = compact(
      await Promise.all(
        hashes.map((hash) => {
          return this.cache.delete(hash) ? hash : undefined
        }),
      ),
    )
    return deletedHashes
  }

  protected override getHandler(hashes: string[]): Promisable<Payload[]> {
    return compact(
      hashes.map((hash) => {
        const resolvedHash = this.bodyHashIndex.get(hash) ?? hash
        const result = this.cache.get(resolvedHash)
        if (resolvedHash !== hash && !result) {
          throw new Error('Missing referenced payload')
        }
        return result
      }),
    )
  }

  protected override async insertHandler(payloads: Payload[]): Promise<Payload[]> {
    const pairs = await PayloadBuilder.hashPairs(payloads)
    const insertedPayloads = await Promise.all(
      pairs.map(([payload, hash]) => {
        return this.insertPayloadIntoCache(payload, hash)
      }),
    )

    return insertedPayloads
  }

  private insertPayloadIntoCache(payload: PayloadWithMeta, hash: string): PayloadWithMeta {
    this.cache.set(hash, payload)
    this.bodyHashIndex.set(payload.$hash, hash)
    return payload
  }
}
