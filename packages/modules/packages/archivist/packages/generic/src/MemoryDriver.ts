import { assertEx } from '@xylabs/assert'
import {
  AbstractCreatable, creatable, CreatableParams,
} from '@xylabs/creatable'
import { exists } from '@xylabs/exists'
import type { Hash, Hex } from '@xylabs/hex'
import type { Promisable } from '@xylabs/promise'
import { isDefined } from '@xylabs/typeof'
import type { ArchivistNextOptions } from '@xyo-network/archivist-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload, WithStorageMeta } from '@xyo-network/payload-model'
import { LRUCache } from 'lru-cache'

import type { ArchivistDriver } from './ArchivistDriver.ts'

export interface MemoryDriverConfig {
  max?: number
}

export interface MemoryDriverParams extends CreatableParams {
  config: MemoryDriverConfig
}

@creatable()
export class MemoryDriver extends AbstractCreatable<MemoryDriverParams>
  implements ArchivistDriver<Hash, Payload, WithStorageMeta<Payload>> {
  private _cache?: LRUCache<Hash, WithStorageMeta<Payload>>
  private _config?: MemoryDriverConfig
  private _dataHashIndex?: LRUCache<Hash, Hash>
  private _sequenceIndex: WithStorageMeta<Payload>[] = []

  protected get cache() {
    this._cache = this._cache ?? new LRUCache<Hash, WithStorageMeta<Payload>>({ max: this.max })
    return this._cache
  }

  protected get config() {
    return assertEx(this._config, () => 'Driver config is not set')
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

  all(): Promisable<WithStorageMeta<Payload>[]> {
    return [...this.cache.values()].filter(exists).toSorted(PayloadBuilder.compareStorageMeta)
  }

  clear(): void | Promise<void> {
    this.cache.clear()
    this.rebuildDataHashIndex()
    this.rebuildDataHashIndex()
  }

  count() {
    return this.cache.size
  }

  override createHandler(): Promisable<void> {
    this._config = this.params.config ?? {}
  }

  async delete(hashes: Hash[]): Promise<WithStorageMeta[]> {
    const deletedPayloads: WithStorageMeta<Payload>[] = (await Promise.all(this.cache
      .dump()
      .map(async ([key, item]) => {
        const itemValueDataHash = await PayloadBuilder.dataHash(item.value)
        if (hashes.includes(key) || hashes.includes(itemValueDataHash)) {
          this.cache.delete(key)
          return item.value
        }
      })))
      .filter(exists)
    this.rebuildDataHashIndex()
    await this.rebuildSequenceIndex()
    return deletedPayloads
  }

  get(hashes: Hash[]): Promisable<WithStorageMeta<Payload>[]> {
    return hashes.map((hash) => {
      const resolvedHash = this.dataHashIndex.get(hash) ?? hash
      const result = this.cache.get(resolvedHash)
      if (resolvedHash !== hash && !result) {
        throw new Error('Missing referenced payload')
      }
      return result
    }).filter(exists)
  }

  insert(payloads: WithStorageMeta<Payload>[]): WithStorageMeta<Payload>[] {
    const payloadsWithMeta = payloads.toSorted(PayloadBuilder.compareStorageMeta)
    this._sequenceIndex.push(...payloadsWithMeta)
    return payloadsWithMeta.map((payload) => {
      return this.insertPayloadIntoCache(payload)
    })
  }

  next(options?: ArchivistNextOptions): Promisable<WithStorageMeta<Payload>[]> {
    const {
      limit = 100, cursor, order, open = true,
    } = options ?? {}
    let all = this._sequenceIndex.toSorted(PayloadBuilder.compareStorageMeta)
    if (order === 'desc') {
      all = all.toReversed()
    }
    const startIndex = isDefined(cursor)
      ? MemoryDriver.findIndexFromCursor(all, cursor) + (open ? 1 : 0)
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
    this._sequenceIndex = (await this.all()).toSorted(PayloadBuilder.compareStorageMeta)
  }
}
