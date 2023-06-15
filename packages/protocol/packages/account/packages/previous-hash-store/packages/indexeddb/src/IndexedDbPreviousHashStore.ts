import { PreviousHashStore } from '@xyo-network/previous-hash-store-model'
import { DBSchema, IDBPDatabase, openDB } from 'idb'

interface PreviousHashStoreSchema extends DBSchema {
  'previous-hash': {
    key: string
    value: string
  }
}

export class IndexedDbPreviousHashStore implements PreviousHashStore {
  private readonly db: Promise<IDBPDatabase<PreviousHashStoreSchema>>

  constructor() {
    this.db = openDB<PreviousHashStoreSchema>(this.dbName, 1, {
      upgrade: (db) => db.createObjectStore(this.storeName),
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
    const value = await (await this.db).get(this.storeName, address)
    return value ?? null
  }
  async removeItem(address: string): Promise<void> {
    await (await this.db).delete(this.storeName, address)
  }
  async setItem(address: string, previousHash: string): Promise<void> {
    await (await this.db).put(this.storeName, previousHash, address)
  }
}
