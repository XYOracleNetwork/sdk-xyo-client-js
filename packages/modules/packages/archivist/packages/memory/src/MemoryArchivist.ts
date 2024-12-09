import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Hash } from '@xylabs/hex'
import { EmptyObject, WithAdditional } from '@xylabs/object'
import { fulfilled, Promisable } from '@xylabs/promise'
import { AbstractArchivist, WithStorageMeta } from '@xyo-network/archivist-abstract'
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
import { Payload, Schema } from '@xyo-network/payload-model'
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

  protected override allHandler(): Promisable<Payload[]> {
    const all = this.cache.dump().map(([, item]) => item.value).filter(exists)
    return MemoryArchivist.sortByStorageMeta(all).map(payload => MemoryArchivist.removeStorageMeta(payload))
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
    await this.rebuildDataHashIndex()
    return deletedHashes
  }

  protected override getHandler(hashes: Hash[]): Promisable<Payload[]> {
    return hashes.map((hash) => {
      const resolvedHash = this.dataHashIndex.get(hash) ?? hash
      const result = this.cache.get(resolvedHash)
      if (resolvedHash !== hash && !result) {
        throw new Error('Missing referenced payload')
      }
      return MemoryArchivist.removeStorageMeta(result)
    }).filter(exists)
  }

  protected override async insertHandler(payloads: Payload[]): Promise<Payload[]> {
    const pairs = await PayloadBuilder.hashPairs(payloads)
    const insertedPayloads = await Promise.all(pairs.map(async ([payload, hash], index) => {
      return this.cache.get(hash) ?? await this.insertPayloadIntoCache(payload, hash, index)
    }))

    return MemoryArchivist.removeStorageMeta(insertedPayloads)
  }

  protected override async nextHandler(options?: ArchivistNextOptions): Promise<Payload[]> {
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

  private async insertPayloadIntoCache(payload: Payload, hash: Hash, index = 0): Promise<WithStorageMeta<Payload>> {
    const dataHash = await PayloadBuilder.dataHash(payload)
    const withMeta = await MemoryArchivist.addSequencedStorageMeta(payload, index)
    this.cache.set(hash, withMeta)
    this.dataHashIndex.set(dataHash, hash)
    return withMeta
  }

  private async rebuildDataHashIndex() {
    this._dataHashIndex = new LRUCache<Hash, Hash>({ max: this.max })
    const pairs = this.cache.dump()
    for (const [hash, payload] of pairs) {
      const dataHash = await PayloadBuilder.dataHash(payload.value)
      this.dataHashIndex.set(dataHash, hash)
    }
  }
}
