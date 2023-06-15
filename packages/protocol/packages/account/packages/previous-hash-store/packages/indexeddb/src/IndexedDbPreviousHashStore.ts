import { PreviousHashStore } from '@xyo-network/previous-hash-store-model'
import { DBSchema, IDBPDatabase, openDB } from 'idb'

interface PreviousHashStoreSchemaV1 extends DBSchema {
  'previous-hash': {
    key: string
    value: string
  }
}

export class IndexedDbPreviousHashStore implements PreviousHashStore {
  static readonly CurrentSchemaVersion = 1
  private readonly db: Promise<IDBPDatabase<PreviousHashStoreSchemaV1>>

  constructor() {
    this.db = openDB<PreviousHashStoreSchemaV1>(this.dbName, IndexedDbPreviousHashStore.CurrentSchemaVersion, {
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
