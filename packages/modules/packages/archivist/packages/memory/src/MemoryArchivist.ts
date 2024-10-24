import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Hash } from '@xylabs/hex'
import { EmptyObject, WithAdditional } from '@xylabs/object'
import { fulfilled, Promisable } from '@xylabs/promise'
import {
  AbstractArchivist, addStorageMeta, removeStorageMeta, sortByStorageMeta, WithStorageMeta,
} from '@xyo-network/archivist-abstract'
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
  Payload, PayloadWithMeta, Schema, WithMeta,
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

  private _cache?: LRUCache<Hash, WithStorageMeta<PayloadWithMeta>>
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
    this._cache = this._cache ?? new LRUCache<Hash, WithStorageMeta<PayloadWithMeta>>({ max: this.max })
    return this._cache
  }

  protected get dataHashIndex() {
    this._dataHashIndex = this._dataHashIndex ?? new LRUCache<Hash, Hash>({ max: this.max })
    return this._dataHashIndex
  }

  protected get max() {
    return this.config?.max ?? 10_000
  }

  protected override allHandler(): Promisable<PayloadWithMeta[]> {
    const all = this.cache.dump().map(([, item]) => item.value).filter(exists)
    return sortByStorageMeta(all).map(payload => removeStorageMeta(payload))
  }

  protected override clearHandler(): void | Promise<void> {
    this.cache.clear()
    this.dataHashIndex.clear()
    return this.emit('cleared', { mod: this })
  }

  protected override async commitHandler(): Promise<WithMeta<BoundWitness>[]> {
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

  protected override deleteHandler(hashes: Hash[]): Promisable<Hash[]> {
    const deletedHashes: Hash[] = this.cache
      .dump()
      .map(([key, item]) => {
        if (hashes.includes(key) || hashes.includes(item.value.$hash)) {
          this.cache.delete(key)
          return key
        }
      })
      .filter(exists)
    this.rebuildDataHashIndex()
    return deletedHashes
  }

  protected override getHandler(hashes: Hash[]): Promisable<PayloadWithMeta[]> {
    return hashes.map((hash) => {
      const resolvedHash = this.dataHashIndex.get(hash) ?? hash
      const result = this.cache.get(resolvedHash)
      if (resolvedHash !== hash && !result) {
        throw new Error('Missing referenced payload')
      }
      return removeStorageMeta(result)
    }).filter(exists)
  }

  protected override async insertHandler(payloads: Payload[]): Promise<PayloadWithMeta[]> {
    const pairs = await PayloadBuilder.hashPairs(payloads, { stamp: false })
    const insertedPayloads = pairs.map(([payload, hash], index) => {
      return this.cache.get(hash) ?? this.insertPayloadIntoCache(payload, hash, index)
    })

    return removeStorageMeta(insertedPayloads)
  }

  protected override async nextHandler(options?: ArchivistNextOptions): Promise<PayloadWithMeta[]> {
    const {
      limit, offset, order,
    } = options ?? {}
    let all = await this.allHandler()
    if (order === 'desc') {
      all = all.reverse()
    }
    const allPairs = await PayloadBuilder.hashPairs(all)
    const startIndex = offset ? allPairs.findIndex(([, hash]) => hash === offset) + 1 : 0
    return allPairs.slice(startIndex, limit ? startIndex + limit : undefined).map(([payload]) => payload)
  }

  private insertPayloadIntoCache(payload: PayloadWithMeta, hash: Hash, index = 0): WithStorageMeta<PayloadWithMeta> {
    const withMeta = addStorageMeta(payload, index)
    this.cache.set(hash, withMeta)
    this.dataHashIndex.set(withMeta.$hash, hash)
    return withMeta
  }

  private rebuildDataHashIndex() {
    this._dataHashIndex = new LRUCache<Hash, Hash>({ max: this.max })
    const pairs = this.cache.dump()
    for (const [hash, payload] of pairs) {
      this.dataHashIndex.set(payload.value.$hash, hash)
    }
  }
}
