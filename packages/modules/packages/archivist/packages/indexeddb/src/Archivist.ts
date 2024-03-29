import { exists } from '@xylabs/exists'
import { Hash } from '@xylabs/hex'
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
import { creatableModule } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, PayloadWithMeta } from '@xyo-network/payload-model'
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
  private static readonly dataHashIndex: IndexDescription = { key: { $hash: 1 }, multiEntry: false, unique: false }
  private static readonly hashIndex: IndexDescription = { key: { _hash: 1 }, multiEntry: false, unique: true }
  private static readonly schemaIndex: IndexDescription = { key: { schema: 1 }, multiEntry: false, unique: false }
  // eslint-disable-next-line @typescript-eslint/member-ordering
  static readonly hashIndexName = buildStandardIndexName(IndexedDbArchivist.hashIndex)
  // eslint-disable-next-line @typescript-eslint/member-ordering
  static readonly dataHashIndexName = buildStandardIndexName(IndexedDbArchivist.dataHashIndex)
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
    return [IndexedDbArchivist.dataHashIndex, IndexedDbArchivist.hashIndex, IndexedDbArchivist.schemaIndex, ...(this.config?.storage?.indexes ?? [])]
  }

  protected override async allHandler(): Promise<PayloadWithMeta[]> {
    // Get all payloads from the store
    const payloads = await this.useDb((db) => db.getAll(this.storeName))
    // Remove any metadata before returning to the client
    return await Promise.all(payloads.map((payload) => PayloadBuilder.build(payload)))
  }

  protected override async clearHandler(): Promise<void> {
    await this.useDb((db) => db.clear(this.storeName))
  }

  protected override async deleteHandler(hashes: Hash[]): Promise<Hash[]> {
    const pairs = await PayloadBuilder.hashPairs(await this.getHandler(hashes))
    const hashesToDelete = pairs.flatMap<Hash>((pair) => [pair[0].$hash, pair[1]])
    // Remove any duplicates
    const distinctHashes = [...new Set(hashesToDelete)]
    return await this.useDb(async (db) => {
      // Only return hashes that were successfully deleted
      const found = await Promise.all(
        distinctHashes.map(async (hash) => {
          // Check if the hash exists
          const existing =
            (await db.getKeyFromIndex(this.storeName, IndexedDbArchivist.hashIndexName, hash)) ??
            (await db.getKeyFromIndex(this.storeName, IndexedDbArchivist.dataHashIndexName, hash))
          // If it does exist
          if (existing) {
            // Delete it
            await db.delete(this.storeName, existing)
            // Return the hash so it gets added to the list of deleted hashes
            return hash
          }
        }),
      )
      return found.filter(exists).filter((hash) => hashes.includes(hash))
    })
  }

  /**
   * Uses an index to get a payload by the index value, but returns the value with the primary key (from the root store)
   * @param db The db instance to use
   * @param storeName The name of the store to use
   * @param indexName The index to use
   * @param key The key to get from the index
   * @returns The primary key and the payload, or undefined if not found
   */
  protected async getFromIndexWithPrimaryKey(
    db: IDBPDatabase<PayloadStore>,
    storeName: string,
    indexName: string,
    key: IDBValidKey,
  ): Promise<[number, PayloadWithMeta] | undefined> {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const index = store.index(indexName)
    const cursor = await index.openCursor(key)
    if (cursor) {
      const singleValue = cursor.value
      // NOTE: It's known to be a number because we are using IndexedDB supplied auto-incrementing keys
      if (typeof cursor.primaryKey !== 'number') {
        throw new TypeError('primaryKey must be a number')
      }

      return [cursor.primaryKey, singleValue]
    }
  }

  protected override async getHandler(hashes: string[]): Promise<PayloadWithMeta[]> {
    const payloads = await this.useDb((db) =>
      Promise.all(hashes.map((hash) => this.getFromIndexWithPrimaryKey(db, this.storeName, IndexedDbArchivist.hashIndexName, hash))),
    )
    const payloadsFromDataHashes = await this.useDb((db) =>
      Promise.all(hashes.map((hash) => this.getFromIndexWithPrimaryKey(db, this.storeName, IndexedDbArchivist.dataHashIndexName, hash))),
    )
    //filter out duplicates
    const found = new Set<string>()
    const payloadsFromHash = payloads.filter(exists).filter(([_key, payload]) => {
      if (found.has(payload.$hash)) {
        return false
      } else {
        found.add(payload.$hash)
        return true
      }
    })
    const payloadsFromDataHash = payloadsFromDataHashes.filter(exists).filter(([_key, payload]) => {
      if (found.has(payload.$hash)) {
        return false
      } else {
        found.add(payload.$hash)
        return true
      }
    })
    return (
      // Merge what we found from the hash and data hash indexes
      [...payloadsFromHash, ...payloadsFromDataHash]
        // Sort in ascending order by primary key (for semi-predictable ordering in terms of insertion order)
        .sort((a, b) => a[0] - b[0])
        // Return just the payloads
        .map(([_key, payload]) => payload)
    )
  }

  protected override async insertHandler(payloads: Payload[]): Promise<PayloadWithMeta[]> {
    const pairs = await PayloadBuilder.hashPairs(payloads)

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
            const existingTopHash = await store.index(IndexedDbArchivist.hashIndexName).get(_hash)
            // If it does not already exist
            if (!existingTopHash) {
              // Insert the payload
              await store.put({ ...payload, _hash })
            }

            // Return it so it gets added to the list of inserted payloads
            return payload
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
    const { dbName, dbVersion, indexes, storeName, logger } = this
    const db = await openDB<PayloadStore>(dbName, dbVersion, {
      blocked(currentVersion, blockedVersion, event) {
        logger.warn(`IndexedDbArchivist: Blocked from upgrading from ${currentVersion} to ${blockedVersion}`, event)
      },
      blocking(currentVersion, blockedVersion, event) {
        logger.warn(`IndexedDbArchivist: Blocking upgrade from ${currentVersion} to ${blockedVersion}`, event)
      },
      terminated() {
        logger.log('IndexedDbArchivist: Terminated')
      },
      upgrade(database, oldVersion, newVersion, transaction) {
        // NOTE: This is called whenever the DB is created/updated. We could simply ensure the desired end
        // state but, out of an abundance of caution, we will just delete (so we know where we are starting
        // from a known good point) and recreate the desired state. This prioritizes resilience over data
        // retention but we can revisit that tradeoff when it becomes limiting. Because distributed browser
        // state is extremely hard to debug, this seems like fair tradeoff for now.
        if (oldVersion !== newVersion) {
          logger.log(`IndexedDbArchivist: Upgrading from ${oldVersion} to ${newVersion}`)
          // Delete any existing databases that are not the current version
          const objectStores = transaction.objectStoreNames
          for (const name of objectStores) {
            try {
              database.deleteObjectStore(name)
            } catch {
              logger.log(`IndexedDbArchivist: Failed to delete existing object store ${name}`)
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
   * Executes a callback with the initialized DB and then closes the db
   * @param callback The method to execute with the initialized DB
   * @returns
   */
  private async useDb<T>(callback: (db: IDBPDatabase<PayloadStore>) => Promise<T> | T): Promise<T> {
    // Get the initialized DB
    const db = await this.getInitializedDb()
    try {
      // Perform the callback
      return await callback(db)
    } finally {
      // Close the DB
      db.close()
    }
  }
}
