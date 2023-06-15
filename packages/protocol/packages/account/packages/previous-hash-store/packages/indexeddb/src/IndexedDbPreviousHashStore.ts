import { PreviousHashStore } from '@xyo-network/previous-hash-store-model'
import { DBSchema, IDBPDatabase, openDB } from 'idb'

export type IndexedDbPreviousHashStoreOpts = {
  /**
   * The database name
   */
  dbName?: string
  /**
   * The name of the object store
   */
  storeName?: string
}

interface PreviousHashStoreSchema extends DBSchema {
  'previous-hash': {
    key: string
    value: string
  }
}

export class IndexedDbPreviousHashStore implements PreviousHashStore {
  static readonly DefaultDbName = 'xyo'

  private readonly _db: Promise<IDBPDatabase<PreviousHashStoreSchema>>

  constructor(protected readonly opts?: IndexedDbPreviousHashStoreOpts) {
    const dbName = this.dbName
    const storeName = this.storeName
    this._db = openDB<PreviousHashStoreSchema>(dbName, 1, {
      upgrade(db) {
        db.createObjectStore(storeName)
      },
    })
  }

  /**
   * The database name.
   */
  get dbName() {
    return 'xyo' as const
  }

  /**
   * The name of the object store.
   */
  get storeName() {
    return 'previous-hash' as const
  }

  async getItem(address: string): Promise<string | null> {
    const value = await (await this._db).get(this.storeName, address)
    return value ?? null
  }
  async removeItem(address: string): Promise<void> {
    await (await this._db).delete(this.storeName, address)
  }
  async setItem(address: string, previousHash: string): Promise<void> {
    await (await this._db).put(this.storeName, previousHash, address)
  }
}
