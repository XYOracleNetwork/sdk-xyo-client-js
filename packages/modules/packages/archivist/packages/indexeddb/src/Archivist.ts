import { uniq } from '@xylabs/array'
import {
  ObjectStore,
  withDb,
  withReadOnlyStore, withReadWriteStore,
} from '@xylabs/indexed-db'
import {
  assertEx,
  exists,
  Hash, Hex, isDefined, isUndefined,
} from '@xylabs/sdk-js'
import { AbstractArchivist, StorageClassLabel } from '@xyo-network/archivist-abstract'
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
  Payload, Schema, WithStorageMeta,
} from '@xyo-network/payload-model'
import { IDBPCursorWithValue, IDBPDatabase } from 'idb'

import { IndexedDbArchivistConfigSchema } from './Config.ts'
import { IndexedDbArchivistParams } from './Params.ts'

export interface PayloadStore {
  [s: string]: WithStorageMeta<Payload>
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
  static override readonly labels = { ...super.labels, [StorageClassLabel]: 'disk' }

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
  private _dbVersion?: number
  private _payloadCount = 0
  private _storeName?: string

  /**
   * The database name. If not supplied via config, it defaults
   * to the module name (not guaranteed to be unique) and if module
   * name is not supplied, it defaults to `archivist`. This behavior
   * biases towards a single, isolated DB per archivist which seems to
   * make the most sense for 99% of use cases.
   */
  get dbName() {
    if (isUndefined(this._dbName)) {
      if (isDefined(this.config?.dbName)) {
        this._dbName = this.config?.dbName
      } else {
        if (isDefined(this.config?.name)) {
          this.logger?.warn('No dbName provided, using module name: ', this.config?.name)
          this._dbName = this.config?.name
        } else {
          this.logger?.warn('No dbName provided, using default name: ', IndexedDbArchivist.defaultDbName)
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
    this._dbVersion = this._dbVersion ?? this.config?.dbVersion ?? IndexedDbArchivist.defaultDbVersion
    return this._dbVersion
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
    if (isUndefined(this._storeName)) {
      if (isDefined(this.config?.storeName)) {
        this._storeName = this.config?.storeName
      } else {
        this.logger?.warn('No storeName provided, using default name: ', IndexedDbArchivist.defaultStoreName)
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
    this._payloadCount = payloads.length
    return payloads
  }

  protected override async clearHandler(): Promise<void> {
    await this.useDb(db => db.clear(this.storeName))
    this._payloadCount = 0
  }

  protected override async deleteHandler(hashes: Hash[]): Promise<WithStorageMeta<Payload>[]> {
    // Filter duplicates to prevent unnecessary DB queries
    const uniqueHashes = [...new Set(hashes)]
    const pairs = await PayloadBuilder.hashPairs(await this.getHandler(uniqueHashes))
    const payloadsToDelete = await Promise.all(pairs.map(([payload]) => payload))
    const hashesToDelete = (await Promise.all(pairs.map(async (pair) => {
      const dataHash0 = await PayloadBuilder.dataHash(pair[0])
      return [dataHash0, pair[1]]
    }))).flat()
    // Remove any duplicates
    const distinctHashes = [...new Set(hashesToDelete)]
    const deletedHashes = await this.useDb(async (db) => {
      // Only return hashes that were successfully deleted
      const found = await Promise.all(
        distinctHashes.map(async (hash) => {
          // Check if the hash exists
          const existing
            = (await db.getKeyFromIndex(this.storeName, IndexedDbArchivist.hashIndexName, hash))
              ?? (await db.getKeyFromIndex(this.storeName, IndexedDbArchivist.dataHashIndexName, hash))
          // If it does exist
          if (isDefined(existing)) {
            // Delete it
            await db.delete(this.storeName, existing)
            // Return the hash so it gets added to the list of deleted hashes
            return hash
          }
        }),
      )
      return found.filter(exists).filter(hash => uniqueHashes.includes(hash))
    })
    const deletedPayloads = payloadsToDelete.filter(payload => deletedHashes.includes(payload._hash) || deletedHashes.includes(payload._dataHash))
    this._payloadCount = this._payloadCount - deletedPayloads.length
    return deletedPayloads
  }

  protected async getFromCursor(
    db: IDBPDatabase<ObjectStore>,
    storeName: string,
    order: 'asc' | 'desc' = 'asc',
    limit: number = 10,
    cursor?: Hex,
    open?: boolean,
  ): Promise<WithStorageMeta[]> {
    // TODO: We have to handle the case where the cursor is not found, and then find the correct cursor to start with (thunked cursor)

    return await withReadOnlyStore(db, storeName, async (store) => {
      const sequenceIndex = assertEx(store?.index(IndexedDbArchivist.sequenceIndexName), () => 'Failed to get sequence index')
      let sequenceCursor: IDBPCursorWithValue<ObjectStore, [string]> | null | undefined
      const parsedCursor = isDefined(cursor)
        ? order === 'asc'
          ? IDBKeyRange.lowerBound(cursor, open)
          : IDBKeyRange.upperBound(cursor, open)
        : null

      sequenceCursor = await sequenceIndex.openCursor(
        parsedCursor,
        order === 'desc' ? 'prev' : 'next',
      )

      let remaining = limit
      const result: WithStorageMeta[] = []
      while (remaining > 0) {
        const value = sequenceCursor?.value
        if (value) {
          result.push(value)
        }
        try {
          sequenceCursor = await sequenceCursor?.advance(1)
        } catch {
          break
        }
        if (sequenceCursor === null) {
          break
        }
        remaining--
      }
      return result
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
    db: IDBPDatabase<ObjectStore>,
    storeName: string,
    indexName: string,
    key: IDBValidKey,
  ): Promise<[number, WithStorageMeta] | undefined> {
    return await withReadOnlyStore(db, storeName, async (store) => {
      if (store) {
        const index = store.index(indexName)
        const cursor = await index.openCursor(key)
        if (cursor) {
          const singleValue = cursor.value
          // It's known to be a number because we are using IndexedDB supplied auto-incrementing keys
          if (typeof cursor.primaryKey !== 'number') {
            throw new TypeError('primaryKey must be a number')
          }

          return [cursor.primaryKey, singleValue]
        }
      }
    })
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
        .toSorted((a, b) => a![0] - b![0])
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

  protected override async insertHandler(payloads: WithStorageMeta<Payload>[]): Promise<WithStorageMeta<Payload>[]> {
    return await this.useDb(async (db) => {
      // Perform all inserts via a single transaction to ensure atomicity
      // with respect to checking for the pre-existence of the hash.
      // This is done to prevent duplicate root hashes due to race
      // conditions between checking vs insertion.
      return await withReadWriteStore(db, this.storeName, async (store) => {
        // Return only the payloads that were successfully inserted
        if (store) {
          const inserted: WithStorageMeta<Payload>[] = []
          await Promise.all(
            payloads.map(async (payload) => {
            // only insert if hash does not already exist
              if (!await store.index(IndexedDbArchivist.hashIndexName).get(payload._hash)) {
                // Insert the payload
                await store.put(payload)
                // Add it to the inserted list
                inserted.push(payload)
              }
            }),
          )
          this._payloadCount = this._payloadCount + inserted.length
          return inserted
        } else {
          throw new Error('Failed to get store')
        }
      })
    })
  }

  protected override async nextHandler(options?: ArchivistNextOptions): Promise<WithStorageMeta<Payload>[]> {
    const {
      limit, cursor, order, open = true,
    } = options ?? {}
    return await this.useDb(async (db) => {
      return await this.getFromCursor(db, this.storeName, order, limit ?? 10, cursor, open)
    })
  }

  protected override payloadCountHandler() {
    return this._payloadCount
  }

  protected override async startHandler() {
    await super.startHandler()
    // We could defer this creation to first access but we
    // want to fail fast here in case something is wrong
    // also, gets current payloadCount
    this._payloadCount = await this.useDb(async (db) => {
      return await db.count(this.storeName)
    })
  }

  /**
   * Executes a callback with the initialized DB and then closes the db
   * @param callback The method to execute with the initialized DB
   * @returns
   */
  private async useDb<T>(callback: (db: IDBPDatabase<ObjectStore>) => Promise<T> | T): Promise<T> {
    return await withDb<ObjectStore, T>(this.dbName, async (db) => {
      return await callback(db)
    }, { [this.storeName]: this.indexes }, this.logger)
  }
}
