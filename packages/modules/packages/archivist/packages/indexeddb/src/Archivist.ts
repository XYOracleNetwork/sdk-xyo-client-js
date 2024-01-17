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
import { IDBPDatabase, IDBPTransaction, openDB, StoreNames } from 'idb'

import { IndexedDbArchivistConfigSchema } from './Config'
import { IndexedDbArchivistParams } from './Params'

export interface PayloadStore {
  [s: string]: Payload
}

const blocked = (currentVersion: number, blockedVersion: number | null, event: IDBVersionChangeEvent): void =>
  console.log(`IndexedDbArchivist: Blocked from upgrading from ${currentVersion} to ${blockedVersion}`, event)
const blocking = (currentVersion: number, blockedVersion: number | null, event: IDBVersionChangeEvent): void => {
  console.log(`IndexedDbArchivist: Blocking upgrade from ${currentVersion} to ${blockedVersion}`, event)
}
const terminated = () => console.log('IndexedDbArchivist: Terminated')

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

  /**
   * The indexes to create on the store
   */
  private get indexes() {
    return [IndexedDbArchivist.hashIndex, IndexedDbArchivist.schemaIndex, ...(this.config?.storage?.indexes ?? [])]
  }

  protected override async allHandler(): Promise<Payload[]> {
    // Get all payloads from the store
    const payloads = await this.useDb((db) => db.getAll(this.storeName))
    // Remove any metadata before returning to the client
    return payloads.map((payload) => PayloadHasher.jsonPayload(payload))
  }

  protected override async clearHandler(): Promise<void> {
    await this.useDb((db) => db.clear(this.storeName))
  }

  protected override async deleteHandler(hashes: string[]): Promise<string[]> {
    // Remove any duplicates
    const distinctHashes = [...new Set(hashes)]
    return await this.useDb(async (db) => {
      // Only return hashes that were successfully deleted
      const found = await Promise.all(
        distinctHashes.map(async (hash) => {
          // Check if the hash exists
          const existing = await db.getKeyFromIndex(this.storeName, IndexedDbArchivist.hashIndexName, hash)
          // If it does exist
          if (existing) {
            // Delete it
            await db.delete(this.storeName, existing)
            // Return the hash so it gets added to the list of deleted hashes
            return hash
          }
        }),
      )
      return found.filter(exists)
    })
  }

  protected override async getHandler(hashes: string[]): Promise<Payload[]> {
    const payloads = await this.useDb((db) =>
      Promise.all(hashes.map((hash) => db.getFromIndex(this.storeName, IndexedDbArchivist.hashIndexName, hash))),
    )
    return payloads.filter(exists)
  }

  protected override async insertHandler(payloads: Payload[]): Promise<Payload[]> {
    const pairs = await PayloadHasher.hashPairs(payloads)
    const db = await this.getInitializedDb()
    try {
      // Only return the payloads that were successfully inserted
      const inserted = await Promise.all(
        pairs.map(async ([payload, _hash]) => {
          // Perform each insert via a transaction to ensure it is atomic
          // with respect to checking for the pre-existence of the hash.
          // This is done to preserve iteration via insertion order.
          const tx = db.transaction(this.storeName, 'readwrite')
          try {
            // Get the object store
            const store = tx.objectStore(this.storeName)
            // Check if the hash already exists
            const existing = await store.index(IndexedDbArchivist.hashIndexName).get(_hash)
            // If it does not already exist
            if (!existing) {
              // Insert the payload
              await store.put({ ...payload, _hash })
              // Return it so it gets added to the list of inserted payloads
              return payload
            }
          } finally {
            // Close the transaction
            await tx.done
          }
        }),
      )
      return inserted.filter(exists)
    } finally {
      db.close()
    }
  }

  protected override async startHandler() {
    await super.startHandler()
    // NOTE: We could defer this creation to first access but we
    // want to fail fast here in case something is wrong
    await this.useDb(() => {})
    return true
  }

  /**
   * Returns that the desired DB/Store initialized to the correct version
   * @returns The initialized DB
   */
  private async getInitializedDb(): Promise<IDBPDatabase<PayloadStore>> {
    const { dbName, dbVersion, indexes, storeName } = this
    const db = await openDB<PayloadStore>(dbName, dbVersion, {
      blocked,
      blocking,
      terminated,
      upgrade(database, oldVersion, newVersion, transaction) {
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
        for (const { key, multiEntry, unique } of indexes) {
          const indexKeys = Object.keys(key)
          const keys = indexKeys.length === 1 ? indexKeys[0] : indexKeys
          const indexName = buildStandardIndexName({ key, unique })
          store.createIndex(indexName, keys, { multiEntry, unique })
        }
      },
    })
    return db
  }

  /**
   * IndexedDb Upgrade Handler
   */
  private upgrade(
    database: IDBPDatabase<PayloadStore>,
    oldVersion: number,
    newVersion: number | null,
    transaction: IDBPTransaction<PayloadStore, StoreNames<PayloadStore>[], 'versionchange'>,
    _event: IDBVersionChangeEvent,
  ) {
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
    const store = database.createObjectStore(this.storeName, {
      // If it isn't explicitly set, create a value by auto incrementing.
      autoIncrement: true,
    })
    // Name the store
    store.name = this.storeName
    // Create an index on the hash
    for (const { key, multiEntry, unique } of this.indexes) {
      const indexKeys = Object.keys(key)
      const keys = indexKeys.length === 1 ? indexKeys[0] : indexKeys
      const indexName = buildStandardIndexName({ key, unique })
      store.createIndex(indexName, keys, { multiEntry, unique })
    }
  }

  /**
   * Executes a callback with the initialized DB and then closes the db
   * @param callback The method to execute with the initialized DB
   * @returns
   */
  private async useDb<T>(callback: (db: IDBPDatabase<PayloadStore>) => Promise<T> | T): Promise<T> {
    const db = await this.getInitializedDb()
    try {
      return await callback(db)
    } finally {
      db.close()
    }
  }
}
