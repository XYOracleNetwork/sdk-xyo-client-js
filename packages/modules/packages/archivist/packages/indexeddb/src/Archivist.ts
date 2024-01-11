import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { AbstractArchivist } from '@xyo-network/archivist-abstract'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistDeleteQuerySchema,
  ArchivistInsertQuerySchema,
  ArchivistModuleEventData,
  IndexDescription,
} from '@xyo-network/archivist-model'
import { PayloadHasher } from '@xyo-network/hash'
import { creatableModule } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { IDBPDatabase, openDB } from 'idb'

import { IndexedDbArchivistConfigSchema } from './Config'
import { IndexedDbArchivistParams } from './Params'

export interface PayloadStore {
  [s: string]: Payload
}

@creatableModule()
export class IndexedDbArchivist<
  TParams extends IndexedDbArchivistParams = IndexedDbArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> extends AbstractArchivist<TParams, TEventData> {
  static override readonly configSchemas = [IndexedDbArchivistConfigSchema]
  static readonly defaultDbName = 'archivist'
  static readonly defaultDbVersion = 1
  static readonly defaultStoreName = 'payloads'
  static readonly hashIndex: Required<IndexDescription> = { key: { _hash: 1 }, name: 'IX__hash', unique: false }
  static readonly schemaIndex: Required<IndexDescription> = { key: { schema: 1 }, name: 'IX_schema', unique: false }

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

  /**
   * The database version. If not supplied via config, it defaults to 1.
   */
  get dbVersion() {
    return this.config?.dbVersion ?? IndexedDbArchivist.defaultDbVersion
  }

  /**
   * The database indexes.
   */
  get indexes() {
    return this.config?.storage?.indexes ?? []
  }

  override get queries() {
    return [ArchivistAllQuerySchema, ArchivistClearQuerySchema, ArchivistDeleteQuerySchema, ArchivistInsertQuerySchema, ...super.queries]
  }
  /**
   * The name of the object store. If not supplied via config, it defaults
   * to `payloads`.
   */
  get storeName() {
    return this.config?.storeName ?? IndexedDbArchivist.defaultStoreName
  }

  private get db(): IDBPDatabase<PayloadStore> {
    return assertEx(this._db, 'DB not initialized')
  }

  protected override async allHandler(): Promise<Payload[]> {
    // Get all payloads from the store
    const payloads = await this.db.getAll(this.storeName)
    // Remove any metadata before returning to the client
    return payloads.map((payload) => PayloadHasher.jsonPayload(payload))
  }

  protected override async clearHandler(): Promise<void> {
    await this.db.clear(this.storeName)
  }

  protected override async deleteHandler(hashes: string[]): Promise<string[]> {
    const distinctHashes = [...new Set(hashes)]
    const found = await Promise.all(
      distinctHashes.map(async (hash) => {
        let existing: IDBValidKey | undefined
        do {
          existing = await this.db.getKeyFromIndex(this.storeName, IndexedDbArchivist.hashIndex.name, hash)
          if (existing) await this.db.delete(this.storeName, existing)
        } while (!existing)
        return hash
      }),
    )
    // Return hashes removed
    return found.filter(exists)
  }

  protected override async getHandler(hashes: string[]): Promise<Payload[]> {
    const payloads = await Promise.all(hashes.map((hash) => this.db.getFromIndex(this.storeName, IndexedDbArchivist.hashIndex.name, hash)))
    return payloads.filter(exists)
  }

  protected override async insertHandler(payloads: Payload[]): Promise<Payload[]> {
    const pairs = await PayloadHasher.hashPairs(payloads)
    // TODO: Only return the payloads that were successfully inserted
    await Promise.all(pairs.map(([payload, _hash]) => this.db.put(this.storeName, { ...payload, _hash })))
    return payloads
  }

  protected override async startHandler() {
    await super.startHandler()
    // NOTE: We could defer this creation to first access but we
    // want to fail fast here in case something is wrong
    const { indexes, storeName, dbName, dbVersion } = this
    this._db = await openDB<PayloadStore>(dbName, dbVersion, {
      async upgrade(database) {
        await Promise.resolve() // Async to match spec
        // Create the store
        const store = database.createObjectStore(storeName, {
          // If it isn't explicitly set, create a value by auto incrementing.
          autoIncrement: true,
        })
        // Name the store
        store.name = storeName
        // Create an index on the hash
        const indexesToCreate = [...indexes, IndexedDbArchivist.hashIndex, IndexedDbArchivist.schemaIndex]
        for (const { key, name, unique } of indexesToCreate) {
          const indexKeys = Object.keys(key)
          const keys = indexKeys.length === 1 ? indexKeys[0] : indexKeys
          const indexName = name ?? `IX_${indexKeys.join('_')}`
          store.createIndex(indexName, keys, { unique })
        }
      },
    })

    return true
  }
}
