import { uniq } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Hash, Hex } from '@xylabs/hex'
import { AbstractArchivist } from '@xyo-network/archivist-abstract'
import {
  ArchivistAllQuerySchema,
  ArchivistClearQuerySchema,
  ArchivistDeleteQuerySchema,
  ArchivistInsertQuerySchema,
  ArchivistModuleEventData,
  ArchivistNextOptions,
  ArchivistNextQuerySchema,
  buildStandardIndexName,
  IndexDescription,
} from '@xyo-network/archivist-model'
import { creatableModule } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import {
  Payload, Schema, StorageMetaConstants, WithStorageMeta,
} from '@xyo-network/payload-model'
import {
  IDBPCursorWithValue, IDBPDatabase, openDB,
} from 'idb'

import { IndexedDbArchivistConfigSchema } from './Config.ts'
import { IndexedDbArchivistParams } from './Params.ts'

export interface PayloadStore {
  [s: string]: WithStorageMeta
}

@creatableModule()
export class IndexedDbArchivist<
  TParams extends IndexedDbArchivistParams = IndexedDbArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
> extends AbstractArchivist<TParams, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, IndexedDbArchivistConfigSchema]
  static override readonly defaultConfigSchema: Schema = IndexedDbArchivistConfigSchema
  static readonly defaultDbName = 'archivist'
  static readonly defaultDbVersion = 1
  static readonly defaultStoreName = 'payloads'
  private static readonly dataHashIndex: IndexDescription = {
    key: { _dataHash: 1 }, multiEntry: false, unique: false,
  }

  private static readonly hashIndex: IndexDescription = {
    key: { _hash: 1 }, multiEntry: false, unique: true,
  }

  private static readonly schemaIndex: IndexDescription = {
    key: { schema: 1 }, multiEntry: false, unique: false,
  }

  private static readonly sequenceIndex: IndexDescription = {
    key: { _sequence: 1 }, multiEntry: false, unique: true,
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  static readonly hashIndexName = buildStandardIndexName(IndexedDbArchivist.hashIndex)
  // eslint-disable-next-line @typescript-eslint/member-ordering
  static readonly dataHashIndexName = buildStandardIndexName(IndexedDbArchivist.dataHashIndex)
  // eslint-disable-next-line @typescript-eslint/member-ordering
  static readonly schemaIndexName = buildStandardIndexName(IndexedDbArchivist.schemaIndex)
  // eslint-disable-next-line @typescript-eslint/member-ordering
  static readonly sequenceIndexName = buildStandardIndexName(IndexedDbArchivist.sequenceIndex)

  private _dbName?: string
  private _storeName?: string

  /**
   * The database name. If not supplied via config, it defaults
   * to the module name (not guaranteed to be unique) and if module
   * name is not supplied, it defaults to `archivist`. This behavior
   * biases towards a single, isolated DB per archivist which seems to
   * make the most sense for 99% of use cases.
   */
  get dbName() {
    if (!this._dbName) {
      if (this.config?.dbName) {
        this._dbName = this.config?.dbName
      } else {
        if (this.config?.name) {
          this.logger.warn('No dbName provided, using module name: ', this.config?.name)
          this._dbName = this.config?.name
        } else {
          this.logger.warn('No dbName provided, using default name: ', IndexedDbArchivist.defaultDbName)
          this._dbName = IndexedDbArchivist.defaultDbName
        }
      }
    }
    return assertEx(this._dbName)
  }

  /**
   * The database version. If not supplied via config, it defaults to 1.
   */
  get dbVersion() {
    return this.config?.dbVersion ?? IndexedDbArchivist.defaultDbVersion
  }

  override get queries() {
    return [
      ArchivistNextQuerySchema,
      ArchivistAllQuerySchema,
      ArchivistClearQuerySchema,
      ArchivistDeleteQuerySchema,
      ArchivistInsertQuerySchema,
      ...super.queries,
    ]
  }

  /**
   * The name of the object store. If not supplied via config, it defaults
   * to `payloads`.
   */
  get storeName() {
    if (!this._storeName) {
      if (this.config?.storeName) {
        this._storeName = this.config?.storeName
      } else {
        this.logger.warn('No storeName provided, using default name: ', IndexedDbArchivist.defaultStoreName)
        this._storeName = IndexedDbArchivist.defaultStoreName
      }
    }
    return assertEx(this._storeName)
  }

  /**
   * The indexes to create on the store
   */
  private get indexes() {
    return [
      IndexedDbArchivist.dataHashIndex,
      IndexedDbArchivist.hashIndex,
      IndexedDbArchivist.schemaIndex,
      IndexedDbArchivist.sequenceIndex,
      ...(this.config?.storage?.indexes ?? []),
    ]
  }

  protected override async allHandler(): Promise<WithStorageMeta<Payload>[]> {
    // Get all payloads from the store
    const payloads = await this.useDb(db => db.getAll(this.storeName))
    // Remove any metadata before returning to the client
    return payloads
  }

  protected override async clearHandler(): Promise<void> {
    await this.useDb(db => db.clear(this.storeName))
  }

  protected override async deleteHandler(hashes: Hash[]): Promise<Hash[]> {
    // Filter duplicates to prevent unnecessary DB queries
    const uniqueHashes = [...new Set(hashes)]
    const pairs = await PayloadBuilder.hashPairs(await this.getHandler(uniqueHashes))
    const hashesToDelete = (await Promise.all(pairs.map(async (pair) => {
      const dataHash0 = await PayloadBuilder.dataHash(pair[0])
      return [dataHash0, pair[1]]
    }))).flat()
    // Remove any duplicates
    const distinctHashes = [...new Set(hashesToDelete)]
    return await this.useDb(async (db) => {
      // Only return hashes that were successfully deleted
      const found = await Promise.all(
        distinctHashes.map(async (hash) => {
          // Check if the hash exists
          const existing
            = (await db.getKeyFromIndex(this.storeName, IndexedDbArchivist.hashIndexName, hash))
            ?? (await db.getKeyFromIndex(this.storeName, IndexedDbArchivist.dataHashIndexName, hash))
          // If it does exist
          if (existing) {
            // Delete it
            await db.delete(this.storeName, existing)
            // Return the hash so it gets added to the list of deleted hashes
            return hash
          }
        }),
      )
      return found.filter(exists).filter(hash => uniqueHashes.includes(hash))
    })
  }

  protected async getFromCursor(
    db: IDBPDatabase<PayloadStore>,
    storeName: string,
      order: 'asc' | 'desc' = 'asc',
      limit: number = 10,
      cursor?: Hex,
  ): Promise<WithStorageMeta[]> {
    // TODO: We have to handle the case where the cursor is not found, and then find the correct cursor to start with (thunked cursor)
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const sequenceIndex = assertEx(store.index(IndexedDbArchivist.sequenceIndexName), () => 'Failed to get sequence index')
    let sequenceCursor: IDBPCursorWithValue<PayloadStore, [string]> | null | undefined = undefined
    const parsedCursor = cursor === StorageMetaConstants.minLocalSequence ? null : cursor
    sequenceCursor = assertEx(await sequenceIndex.openCursor(
      null,
      order === 'desc' ? 'prev' : 'next',
    ), () => `Failed to get cursor [${parsedCursor}, ${cursor}]`)
    if (!sequenceCursor?.value) return []
    try {
      sequenceCursor = parsedCursor ? await sequenceCursor?.continue(parsedCursor) : sequenceCursor // advance to skip the initial value
    } catch {
      return []
    }

    let remaining = limit
    const result: WithStorageMeta[] = []
    while (remaining) {
      const value = sequenceCursor?.value
      if (value) {
        result.push(value)
        try {
          sequenceCursor = await sequenceCursor?.advance(1)
        } catch {
          break
        }
        if (sequenceCursor === null) {
          break
        }
      }
      remaining--
    }
    return result
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
  ): Promise<[number, WithStorageMeta] | undefined> {
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

  protected override async getHandler(hashes: string[]): Promise<WithStorageMeta[]> {
    const payloads = await this.useDb(db =>
      Promise.all(
        // Filter duplicates to prevent unnecessary DB queries
        uniq(hashes).map(async (hash) => {
          // Find by hash
          const payload = await this.getFromIndexWithPrimaryKey(db, this.storeName, IndexedDbArchivist.hashIndexName, hash)
          // If found, return
          if (payload) return payload
          // Otherwise, find by data hash
          return this.getFromIndexWithPrimaryKey(db, this.storeName, IndexedDbArchivist.dataHashIndexName, hash)
        }),
      ))

    const found = new Set<string>()
    return (
      payloads
        // Filter out not found
        .filter(exists)
        // Sort by primary key
        .sort((a, b) => a![0] - b![0])
        // Filter out duplicates by hash
        .filter(([_key, payload]) => {
          if (found.has(payload._hash)) {
            return false
          } else {
            found.add(payload._hash)
            return true
          }
        })
        // Return just the payloads
        .map(([_key, payload]) => payload)
    )
  }

  protected override async insertHandler(payloads: Payload[]): Promise<WithStorageMeta<Payload>[]> {
    // Get the unique pairs of payloads and their hashes
    const payloadWithStorageMeta = await PayloadBuilder.addStorageMeta(payloads)
    return await this.useDb(async (db) => {
      // Perform all inserts via a single transaction to ensure atomicity
      // with respect to checking for the pre-existence of the hash.
      // This is done to prevent duplicate root hashes due to race
      // conditions between checking vs insertion.
      const tx = db.transaction(this.storeName, 'readwrite')
      // Get the object store
      const store = tx.objectStore(this.storeName)
      // Return only the payloads that were successfully inserted
      const inserted: WithStorageMeta<Payload>[] = []
      try {
        await Promise.all(
          payloadWithStorageMeta.map(async (payload) => {
            // Insert the payload
            await store.put(payload)
            // Add it to the inserted list
            inserted.push(payload)
          }),
        )
      } finally {
        // Ensure the transaction is closed
        await tx.done
      }
      return inserted
    })
  }

  protected override async nextHandler(options?: ArchivistNextOptions): Promise<WithStorageMeta<Payload>[]> {
    const {
      limit, cursor, order,
    } = options ?? {}
    return await this.useDb(async (db) => {
      return await this.getFromCursor(db, this.storeName, order, limit ?? 10, cursor)
    })
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
    const {
      dbName, dbVersion, indexes, storeName, logger,
    } = this
    return await openDB<PayloadStore>(dbName, dbVersion, {
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
        for (const {
          key, multiEntry, unique,
        } of indexes) {
          const indexKeys = Object.keys(key)
          const keys = indexKeys.length === 1 ? indexKeys[0] : indexKeys
          const indexName = buildStandardIndexName({ key, unique })
          store.createIndex(indexName, keys, { multiEntry, unique })
        }
      },
    })
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
