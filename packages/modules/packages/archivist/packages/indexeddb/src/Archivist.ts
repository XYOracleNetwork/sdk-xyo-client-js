import { distinct } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { AbstractArchivist } from '@xyo-network/archivist-abstract'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistDeleteQuerySchema,
  ArchivistInsertQuerySchema,
  ArchivistModuleEventData,
} from '@xyo-network/archivist-model'
import { PayloadHasher } from '@xyo-network/hash'
import { creatableModule } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { DBSchema, IDBPDatabase, openDB } from 'idb'
import { clear, createStore, delMany, entries, getMany, setMany, UseStore } from 'idb-keyval'

import { IndexedDbArchivistConfigSchema } from './Config'
import { IndexedDbArchivistParams } from './Params'

// type PayloadStore<T extends string = string> = DBSchema & { [key in T]: { key: string; value: Payload } }

/**
 * The index direction (1 for ascending, -1 for descending)
 */
export type IndexDirection = -1 | 1

/**
 * Description of index(es) to be created on a store
 */
export type IndexDescription = {
  /**
   * The key(s) to index
   */
  key:
    | {
        [key: string]: IndexDirection
      }
    | Map<string, IndexDirection>
  /**
   * The name of the index
   */
  name: string
  /**
   * If true, the index must enforce uniqueness on the key
   */
  unique?: boolean
}

export interface PayloadStore {
  [s: string]: Payload
}

@creatableModule()
export class IndexedDbArchivist<
  TParams extends IndexedDbArchivistParams = IndexedDbArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> extends AbstractArchivist<TParams, TEventData> {
  static override configSchemas = [IndexedDbArchivistConfigSchema]
  static defaultDbName = 'archivist'
  static defaultStoreName = 'payloads'

  private _db: IDBPDatabase<PayloadStore> | undefined

  /**
   * The database name. If not supplied via config, it defaults
   * to the module name (not guaranteed to be unique) and if module
   * name is not supplied, it defaults to `archivist`. This behavior
   * biases towards a single, isolated DB per archivist which seems to
   * make the most sense for 99% of use cases.
   */
  get dbName() {
    return this.config?.dbName ?? this.config?.name ?? IndexedDbArchivist.defaultDbName
  }

  override get queries() {
    return [ArchivistAllQuerySchema, ArchivistClearQuerySchema, ArchivistDeleteQuerySchema, ArchivistInsertQuerySchema, ...super.queries]
  }
  /**
   * The name of the object store. If not supplied via config, it defaults
   * to `payloads`. The limitation of the current IndexedDB wrapper we're
   * using is that it only supports a single object store per DB. See here:
   * https://github.com/jakearchibald/idb-keyval/blob/main/custom-stores.md#defining-a-custom-database--store-name
   * If this becomes a problem or we need migrations/transactions, we can
   * move to this more-flexible library, which they recommend (and who
   * recommends them for our simple use case of key-value storage):
   * https://www.npmjs.com/package/idb
   */
  get storeName() {
    return this.config?.storeName ?? IndexedDbArchivist.defaultStoreName
  }

  private get db(): IDBPDatabase<PayloadStore> {
    return assertEx(this._db, 'DB not initialized')
  }

  protected override async allHandler(): Promise<Payload[]> {
    const payloads = await this.db.getAll(this.storeName)
    return payloads
  }

  protected override async clearHandler(): Promise<void> {
    await this.db.clear(this.storeName)
  }

  protected override async deleteHandler(hashes: string[]): Promise<string[]> {
    const found = await Promise.all(
      // TODO: Filter for distinct hashes first
      hashes.map(async (hash) => {
        const existing = await this.get([hash])
        if (existing.length === 0) return
        this.db.delete(this.storeName, hash)
        return hash
      }),
    )
    return found.filter(exists)
  }

  protected override async getHandler(hashes: string[]): Promise<Payload[]> {
    const payloads = await Promise.all(hashes.map((hash) => this.db.get(this.storeName, hash)))
    return payloads.filter(exists)
  }

  protected override async insertHandler(payloads: Payload[]): Promise<Payload[]> {
    const hashed = await PayloadHasher.toMap(payloads)
    // TODO: Only return the payloads that were successfully inserted
    await Promise.all(Object.entries(hashed).map(([hash, payload]) => this.db.put(this.storeName, payload, hash)))
    return payloads
  }

  protected override async startHandler() {
    await super.startHandler()
    // NOTE: We could defer this creation to first access but we
    // want to fail fast here in case something is wrong
    const storeName = this.storeName
    const configIndexes = (this.config as { storage?: { indexes?: IndexDescription[] } })?.storage?.indexes ?? []
    this._db = await openDB<PayloadStore>(this.dbName, 1, {
      async upgrade(database) {
        await Promise.resolve() // Async to match spec
        // Create the store
        const store = database.createObjectStore(storeName)
        // Name the store
        store.name = storeName
        // Create the indexes
        for (const index of configIndexes) {
          const { key, name, unique } = index
          if (name && key) {
            const keys = Object.keys(key)
            store.createIndex(name, keys, { unique })
          }
        }
      },
    })

    return true
  }
}
