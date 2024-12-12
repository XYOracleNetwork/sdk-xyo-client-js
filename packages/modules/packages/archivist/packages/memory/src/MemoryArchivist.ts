import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Hash, Hex } from '@xylabs/hex'
import { EmptyObject, WithAdditional } from '@xylabs/object'
import { fulfilled, Promisable } from '@xylabs/promise'
import { AbstractArchivist } from '@xyo-network/archivist-abstract'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistCommitQuerySchema,
  ArchivistConfig,
  ArchivistDeleteQuerySchema,
  ArchivistInsertQuery,
  ArchivistInsertQuerySchema,
  ArchivistModuleEventData,
  ArchivistNextOptions,
  ArchivistNextQuerySchema,
  AttachableArchivistInstance,
} from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import {
  AnyConfigSchema, creatableModule, ModuleInstance, ModuleParams,
} from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import {
  Payload, Schema, WithStorageMeta,
} from '@xyo-network/payload-model'
import { LRUCache } from 'lru-cache'

export type MemoryArchivistConfigSchema = 'network.xyo.archivist.memory.config'
export const MemoryArchivistConfigSchema: MemoryArchivistConfigSchema = 'network.xyo.archivist.memory.config'

export type MemoryArchivistConfig<TConfig extends Payload | EmptyObject | void = void, TSchema extends Schema | void = void> = ArchivistConfig<
  WithAdditional<
    {
      max?: number
    },
    TConfig
  >,
  TSchema extends Schema ? TSchema : MemoryArchivistConfigSchema | ArchivistConfig['schema']
>

export type MemoryArchivistParams<TConfig extends AnyConfigSchema<MemoryArchivistConfig> = AnyConfigSchema<MemoryArchivistConfig>> =
  ModuleParams<TConfig>
@creatableModule()
export class MemoryArchivist<
  TParams extends MemoryArchivistParams<AnyConfigSchema<MemoryArchivistConfig>> = MemoryArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
>
  extends AbstractArchivist<TParams, TEventData>
  implements AttachableArchivistInstance, ModuleInstance {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, MemoryArchivistConfigSchema]
  static override readonly defaultConfigSchema: Schema = MemoryArchivistConfigSchema

  private _cache?: LRUCache<Hash, WithStorageMeta<Payload>>
  private _dataHashIndex?: LRUCache<Hash, Hash>

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

  protected get cache() {
    this._cache = this._cache ?? new LRUCache<Hash, WithStorageMeta<Payload>>({ max: this.max })
    return this._cache
  }

  protected get dataHashIndex() {
    this._dataHashIndex = this._dataHashIndex ?? new LRUCache<Hash, Hash>({ max: this.max })
    return this._dataHashIndex
  }

  protected get max() {
    return this.config?.max ?? 10_000
  }

  private static findIndexFromCursor(payloads: WithStorageMeta[], cursor: Hex) {
    const index = payloads.findIndex(({ _sequence }) => _sequence === cursor)
    if (index === -1) {
      return Infinity // move to the end
    }
    return index
  }

  protected override allHandler(): Promisable<WithStorageMeta<Payload>[]> {
    const all = this.cache.dump().map(([, item]) => item.value).filter(exists)
    return PayloadBuilder.sortByStorageMeta(all)
  }

  protected override clearHandler(): void | Promise<void> {
    this.cache.clear()
    this.dataHashIndex.clear()
    return this.emit('cleared', { mod: this })
  }

  protected override async commitHandler(): Promise<BoundWitness[]> {
    const payloads = assertEx(await this.allHandler(), () => 'Nothing to commit')
    const settled = await Promise.allSettled(
      Object.values((await this.parentArchivists()).commit ?? [])?.map(async (parent) => {
        const queryPayload: ArchivistInsertQuery = { schema: ArchivistInsertQuerySchema }
        const query = await this.bindQuery(queryPayload, payloads)
        return (await parent?.query(query[0], query[1]))?.[0]
      }).filter(exists),
    )
    await this.clearHandler()
    return settled.filter(fulfilled).map(result => result.value).filter(exists)
  }

  protected override async deleteHandler(hashes: Hash[]): Promise<Hash[]> {
    const deletedHashes: Hash[] = (await Promise.all(this.cache
      .dump()
      .map(async ([key, item]) => {
        const itemValueDataHash = await PayloadBuilder.dataHash(item.value)
        if (hashes.includes(key) || hashes.includes(itemValueDataHash)) {
          this.cache.delete(key)
          return key
        }
      })))
      .filter(exists)
    this.rebuildDataHashIndex()
    return deletedHashes
  }

  protected override getHandler(hashes: Hash[]): Promisable<WithStorageMeta<Payload>[]> {
    return hashes.map((hash) => {
      const resolvedHash = this.dataHashIndex.get(hash) ?? hash
      const result = this.cache.get(resolvedHash)
      if (resolvedHash !== hash && !result) {
        throw new Error('Missing referenced payload')
      }
      return result
    }).filter(exists)
  }

  protected override async insertHandler(payloads: Payload[]): Promise<WithStorageMeta<Payload>[]> {
    const payloadsWithMeta = (await PayloadBuilder.addStorageMeta(payloads)).sort(PayloadBuilder.compareStorageMeta)
    const insertedPayloads = await Promise.all(payloadsWithMeta.map(async (payload) => {
      return this.cache.get(payload._hash) ?? await this.insertPayloadIntoCache(payload)
    }))

    return insertedPayloads
  }

  protected override async nextHandler(options?: ArchivistNextOptions): Promise<WithStorageMeta<Payload>[]> {
    const {
      limit, cursor, order,
    } = options ?? {}
    let all = await this.allHandler()
    if (order === 'desc') {
      all = all.reverse()
    }
    const startIndex = cursor
      ? MemoryArchivist.findIndexFromCursor(all, cursor) + 1
      : 0
    const result = all.slice(startIndex, limit ? startIndex + limit : undefined)
    return result
  }

  private async insertPayloadIntoCache(payload: Payload): Promise<WithStorageMeta<Payload>> {
    const withMeta = await PayloadBuilder.addStorageMeta(payload)
    this.cache.set(withMeta._hash, withMeta)
    this.dataHashIndex.set(withMeta._dataHash, withMeta._hash)
    return withMeta
  }

  private rebuildDataHashIndex() {
    this._dataHashIndex = new LRUCache<Hash, Hash>({ max: this.max })
    const payloads = this.cache.dump().map(([, item]) => item.value)
    for (const payload of payloads) {
      this.dataHashIndex.set(payload._dataHash, payload._hash)
    }
  }
}
