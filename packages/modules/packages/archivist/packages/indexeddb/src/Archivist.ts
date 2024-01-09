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
  static defaultDbName = 'archivist'
  static defaultDbVersion = 1
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
    // Filter duplicates
    const distinctHashes = [...new Set(hashes)]
    const found = await Promise.all(
      distinctHashes.map(async (hash) => {
        const existing = await this.db.getFromIndex(this.storeName, 'hash', hash)
        if (existing.length === 0) return
        this.db.delete(this.storeName, hash)
        return hash
      }),
    )
    // Return hashes removed
    return found.filter(exists)
  }

  protected override async getHandler(hashes: string[]): Promise<Payload[]> {
    const payloads = await Promise.all(hashes.map((hash) => this.db.getFromIndex(this.storeName, 'hash', hash)))
    return payloads.filter(exists)
  }

  protected override async insertHandler(payloads: Payload[]): Promise<Payload[]> {
    const hashed = await PayloadHasher.toMap(payloads)
    // TODO: Only return the payloads that were successfully inserted
    await Promise.all(Object.entries(hashed).map(([hash, payload]) => this.db.put(this.storeName, { ...payload, _hash: hash })))
    return payloads
  }

  protected override async startHandler() {
    await super.startHandler()
    // NOTE: We could defer this creation to first access but we
    // want to fail fast here in case something is wrong
    const storeName = this.storeName
    this._db = await openDB<PayloadStore>(this.dbName, this.dbVersion, {
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
        store.createIndex('hash', '_hash', { multiEntry: true, unique: false })
        // TODO: Create additional indexes from config
      },
    })

    return true
  }
}
