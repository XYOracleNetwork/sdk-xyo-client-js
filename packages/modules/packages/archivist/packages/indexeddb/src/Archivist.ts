import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { AbstractArchivist } from '@xyo-network/archivist-abstract'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistDeleteQuerySchema,
  ArchivistInsertQuerySchema,
  ArchivistModuleEventData,
  buildStandardIndexName,
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
  static override configSchemas = [IndexedDbArchivistConfigSchema]
  static readonly defaultDbName = 'archivist'
  static readonly defaultDbVersion = 1
  static readonly defaultStoreName = 'payloads'
  private static readonly hashIndex: IndexDescription = { key: { _hash: 1 }, multiEntry: false, unique: true }
  private static readonly schemaIndex: IndexDescription = { key: { schema: 1 }, multiEntry: false, unique: false }
  // eslint-disable-next-line @typescript-eslint/member-ordering
  static readonly hashIndexName = buildStandardIndexName(IndexedDbArchivist.hashIndex)
  // eslint-disable-next-line @typescript-eslint/member-ordering
  static readonly schemaIndexName = buildStandardIndexName(IndexedDbArchivist.schemaIndex)

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

  private get indexes() {
    return this.config?.storage?.indexes ?? []
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
          existing = await this.db.getKeyFromIndex(this.storeName, IndexedDbArchivist.hashIndexName, hash)
          if (existing) await this.db.delete(this.storeName, existing)
        } while (!existing)
        return hash
      }),
    )
    // Return hashes removed
    return found.filter(exists)
  }

  protected override async getHandler(hashes: string[]): Promise<Payload[]> {
    const payloads = await Promise.all(hashes.map((hash) => this.db.getFromIndex(this.storeName, IndexedDbArchivist.hashIndexName, hash)))
    return payloads.filter(exists)
  }

  protected override async insertHandler(payloads: Payload[]): Promise<Payload[]> {
    const pairs = await PayloadHasher.hashPairs(payloads)
    // Only return the payloads that were successfully inserted
    const inserted = await Promise.all(
      pairs.map(async ([payload, _hash]) => {
        const tx = this.db.transaction(this.storeName, 'readwrite')
        try {
          const store = tx.objectStore(this.storeName)
          const existing = await store.index(IndexedDbArchivist.hashIndexName).get(_hash)
          if (!existing) {
            await store.put({ ...payload, _hash })
            return payload
          }
        } finally {
          await tx.done
        }
      }),
    )
    return inserted.filter(exists)
  }

  protected override async startHandler() {
    await super.startHandler()
    // NOTE: We could defer this creation to first access but we
    // want to fail fast here in case something is wrong
    const { dbName, dbVersion, indexes, storeName } = this
    this._db = await openDB<PayloadStore>(dbName, dbVersion, {
      async blocked(currentVersion, blockedVersion, event) {
        await Promise.resolve()
        console.log(`IndexedDbArchivist: Blocked from upgrading from ${currentVersion} to ${blockedVersion}`, event)
      },
      async blocking(currentVersion, blockedVersion, event) {
        await Promise.resolve()
        console.log(`IndexedDbArchivist: Blocking upgrade from ${currentVersion} to ${blockedVersion}`, event)
      },
      async terminated() {
        await Promise.resolve()
        console.log('IndexedDbArchivist: Terminated')
      },
      async upgrade(database, oldVersion, newVersion, transaction, event) {
        await Promise.resolve() // Async to match spec
        if (oldVersion !== newVersion) {
          console.log(`IndexedDbArchivist: Upgrading from ${oldVersion} to ${newVersion}`)
          // Delete any existing databases that are not the current version
          const objectStores = transaction.objectStoreNames
          for (const name of objectStores) {
            try {
              database.deleteObjectStore(name)
            } catch {
              console.log(`IndexedDbArchivist: Failed to delete object store ${name}`)
            }
          }
        }
        // Create the store
        const store = database.createObjectStore(storeName, {
          // If it isn't explicitly set, create a value by auto incrementing.
          autoIncrement: true,
        })
        // Name the store
        store.name = storeName
        // Create an index on the hash
        const indexesToCreate = [IndexedDbArchivist.hashIndex, IndexedDbArchivist.schemaIndex, ...indexes]
        for (const { key, multiEntry, unique } of indexesToCreate) {
          const indexKeys = Object.keys(key)
          const keys = indexKeys.length === 1 ? indexKeys[0] : indexKeys
          const indexName = buildStandardIndexName({ key, unique })
          store.createIndex(indexName, keys, { multiEntry, unique })
        }
      },
    })
    this._db.close()
    return true
  }
}
