import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Hash, Hex } from '@xylabs/hex'
import { fulfilled, Promisable } from '@xylabs/promise'
import { Account, AccountInstance } from '@xyo-network/account'
import { AbstractArchivist } from '@xyo-network/archivist-abstract'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistCommitQuerySchema,
  ArchivistDeleteQuerySchema,
  ArchivistInsertQuery,
  ArchivistInsertQuerySchema,
  ArchivistModuleEventData,
  ArchivistNextOptions,
  ArchivistNextQuerySchema,
  ArchivistParams,
  AttachableArchivistInstance,
} from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import {
  AnyConfigSchema, creatableModule, ModuleInstance,
} from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import {
  Payload, Schema, WithStorageMeta,
} from '@xyo-network/payload-model'
import { LRUCache } from 'lru-cache'

import { MemoryArchivistConfig, MemoryArchivistConfigSchema } from './Config.ts'

export type MemoryArchivistParams<TConfig extends AnyConfigSchema<MemoryArchivistConfig> = AnyConfigSchema<MemoryArchivistConfig>> =
  ArchivistParams<TConfig>
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
  private _sequenceIndex: WithStorageMeta<Payload>[] = []

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

  async from(payloads: Payload[], account?: AccountInstance): Promise<MemoryArchivist> {
    const archivist = await MemoryArchivist.create({ account: account ?? await Account.random() })
    await archivist.insert(payloads)
    return archivist
  }

  protected override allHandler(): Promisable<WithStorageMeta<Payload>[]> {
    return [...this.cache.values()].filter(exists).sort(PayloadBuilder.compareStorageMeta)
  }

  protected override clearHandler(): void | Promise<void> {
    this.cache.clear()
    this.rebuildDataHashIndex()
    this.rebuildDataHashIndex()
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
    await this.rebuildSequenceIndex()
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

  protected override insertHandler(payloads: WithStorageMeta<Payload>[]): WithStorageMeta<Payload>[] {
    const payloadsWithMeta = payloads.toSorted(PayloadBuilder.compareStorageMeta)
    this._sequenceIndex.push(...payloads)
    return payloadsWithMeta.map((payload) => {
      return this.insertPayloadIntoCache(payload)
    })
  }

  protected override nextHandler(options?: ArchivistNextOptions): Promisable<WithStorageMeta<Payload>[]> {
    const {
      limit = 100, cursor, order, open = true,
    } = options ?? {}
    let all = this._sequenceIndex
    if (order === 'desc') {
      all = all.toReversed()
    }
    const startIndex = cursor
      ? MemoryArchivist.findIndexFromCursor(all, cursor) + (open ? 1 : 0)
      : 0
    return all.slice(startIndex, startIndex + limit)
  }

  private insertPayloadIntoCache(payload: WithStorageMeta<Payload>): WithStorageMeta<Payload> {
    this.cache.set(payload._hash, payload)
    this.dataHashIndex.set(payload._dataHash, payload._hash)
    return payload
  }

  private rebuildDataHashIndex() {
    this._dataHashIndex = new LRUCache<Hash, Hash>({ max: this.max })
    const payloads = this.cache.dump().map(([, item]) => item.value)
    for (const payload of payloads) {
      this.dataHashIndex.set(payload._dataHash, payload._hash)
    }
  }

  private async rebuildSequenceIndex() {
    this._sequenceIndex = (await this.allHandler()).toSorted(PayloadBuilder.compareStorageMeta)
  }
}
